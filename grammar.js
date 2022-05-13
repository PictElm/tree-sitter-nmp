/// <reference path="node_modules/tree-sitter-cli/dsl.d.ts" />
module.exports = grammar({

  name: 'nmp',

  extras: $ => [
    $.comment,
    /[ \t\r\n]/,
  ],

  conflicts: $ => [
    [$.bit_field_expression, $.arithmetic_expression, $.comparison_expression],
    [$.bit_field_expression, $.shift_operation, $.comparison_expression],
  ],

  rules: {

    top_level: $ => repeat($.specification),
    specification: $ => choice(
      $.type_specification,
      $.let_specification,
      $.register_specification,
      $.memory_specification,
      $.variable_specification,
      $.operation_specification,
      $.mode_specification,
      $.extend_specification,
      $.top_level_selection,
      $.macro_directive,
      $.include_directive,
      $.delayed_include_directive,
      $.other_directive, // YYY: e.g. '#line n,m file.ext'
    ),

    type_specification: $ => seq(
      'type', $.identifier,
      '=', $.type_expression,
    ),
    let_specification: $ => seq(
      'let', optional('*'), $.identifier,
      optional(seq(':', $.type_expression)),
      '=', $.expression, // YYY: doc says constant_expression
    ),
    register_specification: $ => seq(
      'reg', field('id', $.identifier),
      '[', field('size', $.expression), ',', field('type', $.type_expression), ']',
      optional($.attributes),
    ),
    memory_specification: $ => seq(
      'mem', field('id', $.identifier),
      '[', field('ns', $.expression), optional(seq(',', field('t', $.type_expression))), ']',
      optional($.attributes),
    ),
    variable_specification: $ => seq( // XXX: not documented lol (todo: test behavior)
      'var', field('id', $.identifier),
      '[', field('ns', $.expression), optional(seq(',', field('t', $.type_expression))), ']',
      optional($.attributes),
    ),
    operation_specification: $ => choice(
      $.or_operation_specification,
      $.and_operation_specification,
    ),
    mode_specification: $ => choice(
      $.or_mode_specification,
      $.and_mode_specification,
    ),
    extend_specification: $ => seq(
      'extend', repeatSep1($.identifier, ','),
      $.attributes,
    ),
    top_level_selection: $ => seq(
      'if', $.expression,
      'then', repeat($.specification),
      optional(seq('else', repeat($.specification))),
      'endif',
    ),
    other_directive: $ => seq('#', token.immediate(/[a-zA-Z_][a-zA-Z_0-9]*/), /.*/),

    attributes: $ => repeat1($.attribute),
    attribute: $ => choice(
      seq('alias', optional('='), $.location), // YYY: sometimes no '=' is ok
      seq($.identifier, '=', choice($.expression, seq('{', optional($.sequence), '}'))),
    ),

    location: $ => choice(
      seq(
        field('id', $.identifier),
        optional(choice(
          seq('[', field('index', $.expression), ']'),
          seq('<', field('up', $.expression), '..', field('low', $.expression), '>'),
        )),
      ),
      prec.left(seq($.location, '::', $.location)),
    ),

    parameter: $ => seq($.identifier, ':', $.type_expression),
    arguments: $ => repeatSep1($.expression, ','),

    or_operation_specification: $ => seq(
      'op', field('id', $.identifier),
      '=', repeatSep1($.identifier, '|'),
    ),
    and_operation_specification: $ => seq(
      'op', field('id', $.identifier),
      '(', repeatSep($.parameter, ','), ')',
      optional($.attributes),
    ),
    or_mode_specification: $ => seq(
      'mode', field('id', $.identifier),
      '=', repeatSep1($.identifier, '|'),
    ),
    and_mode_specification: $ => seq(
      'mode', field('id', $.identifier),
      '(', repeatSep($.parameter, ','), ')',
      '=', $.expression,
      optional($.attributes),
    ),

    sequence: $ => repeat1($.statement),
    statement: $ => seq(choice(
      $.action_statement,
      $.assignment_statement,
      $.conditional_statement,
      $.switch_statement,
      $.canon_statement,
      $.call_statement,
      $.let_statement,
      $.for_statement,
    ), ';'),

    action_statement: $ => seq($.identifier, optional(seq('.', $.identifier))),
    assignment_statement: $ => seq($.location, '=', $.expression),
    conditional_statement: $ => seq(
      'if', $.expression,
      'then', optional($.sequence),
      optional(seq('else', optional($.sequence))),
      'endif',
    ),
    switch_statement: $ => seq(
      'switch', '(', field('c', $.expression), ')',
      '{', repeat($.case), optional($.default), '}',
    ),
    canon_statement: $ => choice(
      seq($.string, '(', optional($.arguments), ')'),
      seq('canon', '(', $.string, optional(seq(',', $.arguments)), ')'),
    ),
    call_statement: $ => seq($.identifier, '(', optional($.arguments), ')'),
    let_statement: $ => seq(
      'let', $.identifier,
      optional(seq(':', $.type_expression)),
      '=', $.expression,
    ),
    for_statement: $ => seq(
      'for', field('i', $.identifier),
      'in', field('lo', $.expression), '..', field('up', $.expression),
      'do', optional($.sequence),
      'enddo',
    ),

    case: $ => seq('case', field('v', $.expression), ':', field('r', $.expression)),
    default: $ => seq('default', ':', field('r', $.expression)),

    expression: $ => choice(
      $.constant_expression,
      $.reference_expression,
      $.dotted_expression,
      $.unary_expression,
      $.binary_expression,
      $.bit_field_expression,
      $.concat_expression,
      $.format_expression,
      $.if_expression,
      $.switch_expression,
      seq('(', $.expression, ')'),
    ),
    constant_expression: $ => $.litteral,
    reference_expression: $ => seq($.identifier, optional(seq('[', field('i', $.expression), ']'))),
    dotted_expression: $ => seq(field('pid', $.identifier), '.', field('cid', $.identifier)),
    unary_expression: $ => choice(
      seq('+', $.expression),
      seq('-', $.expression),
      seq('~', $.expression),
      seq('!', $.expression),
    ),
    binary_expression: $ => choice(
      $.arithmetic_expression,
      $.comparison_expression,
      $.logical_expression,
      $.bit_operation,
      $.shift_operation,
      $.coerce_expression,
    ),
    bit_field_expression: $ => prec(42, seq($.expression, '<', $.expression, '..', $.expression, '>')),
    concat_expression: $ => binOpsWithPrec($.expression, ['::'], $.expression)[0],
    format_expression: $ => seq('format', '(', $.string, optional(seq(',', $.arguments)), ')'),
    if_expression: $ => seq(
      'if', field('c', $.expression),
      'then', field('t', $.expression),
      'else', field('e', $.expression),
      'endif',
    ),
    switch_expression: $ => seq(
      'switch', '(', field('c', $.expression), ')',
      '{', repeat($.case), optional($.default), '}',
    ),
    arithmetic_expression: $ => choice(...binOpsWithPrec($.expression, ['+', '-', '*', '/', '%', '**'], $.expression)),
    comparison_expression: $ => choice(...binOpsWithPrec($.expression, ['==', '!=', '<', '<=', '>', '>='], $.expression)),
    logical_expression: $ => choice(...binOpsWithPrec($.expression, ['&&', '||'], $.expression)),
    bit_operation: $ => choice(...binOpsWithPrec($.expression, ['&', '|', '^'], $.expression)),
    shift_operation: $ => choice(...binOpsWithPrec($.expression, ['<<', '>>', '<<<', '>>>'], $.expression)),
    coerce_expression: $ => seq('coerce', '(', $.type_expression, ',', $.expression, ')'),

    type_expression: $ => choice(
      $.bool_type,
      $.int_type,
      $.card_type,
      $.fix_type,
      $.float_type,
      $.range_type,
      $.enum_type,
      $.named_type,
    ),
    bool_type: $ => 'bool',
    int_type: $ => seq('int', '(', field('N', $.integer), ')'),
    card_type: $ => seq('card', '(', field('N', $.integer), ')'),
    fix_type: $ => seq('fix', '(', field('I', $.integer), ',', field('F', $.integer), ')'),
    float_type: $ => seq('float', '(', field('M', $.integer), ',', field('E', $.integer), ')'),
    range_type: $ => seq('[', field('L', $.integer), '..', field('U', $.integer), ']'),
    enum_type: $ => seq('enum', '(', repeatSep1($.value, ','), ')'),
    named_type: $ => $.identifier,

    value: $ => choice(
      $.integer,
      seq($.integer, '..', $.integer),
    ),

    macro_directive: $ => seq(
      'macro', $.identifier,
      '(', repeatSep($.identifier, ','), ')',
      '=', /([^\r\n]|\\\r?\n)*\r?\n/
    ),
    include_directive: $ => seq('include', $.string),
    delayed_include_directive: $ => seq('include', optional(choice('-', '_')), 'op', $.string),

    identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/,
    // reserved keywords:
    // _attr     action  field      bool     canon
    // card      case    coerce     default
    // do        else    enddo      endif
    // enum      error   exception  extend   false
    // fix       float   for        format
    // if        image   in         include  initial
    // int       let     macro      mode
    // not       op      ports      reg
    // resource  switch  syntax     then
    // true      type    uses       var
    // volatile

    litteral: $ => choice(
      $.boolean,
      $.integer,
      $.real,
      $.string,
    ),

    boolean: $ => choice('true', 'false'),
    integer: $ => choice(
      /[0-9]+/,
      /0[xX][0-9a-fA-F]+/,
      /0[bB][01]+/,
    ),
    real: $ => choice(
      /[0-9]+\.[0-9]+/,
      /[0-9]+[eE][+-]?[0-9]+/,
      /[0-9]+\.[0-9]+[eE][+-]?[0-9]+/,
    ),
    string: $ => /"(\\.|[^"])*"/,

    comment: $ => choice(
      seq('//', /.*/),
      seq('/*', /(\*[^/]|[^*])*/, '*/'),
    ),

  },

});

function repeatSep1(rule, sep) {
  return seq(
    rule,
    repeat(seq(sep, rule)),
  );
}

function repeatSep(rule, sep) {
  return optional(repeatSep1(rule, sep));
}

function binOpsWithPrec(left, ops, right) {
  // location in table is prec
  const OP_PREC = [
    { '::': 'left' },
    { '||': 'left' },
    { '&&': 'left' },
    { '|': 'left' },
    { '^': 'left' },
    { '&': 'left' },
    { '==': 'left', '!=': 'left' },
    { '<': 'left', '<=': 'left', '>': 'left', '>=': 'left' },
    { '<<': 'left', '>>': 'left', '<<<': 'left', '>>>': 'left' },
    { '+': 'left', '-': 'left' },
    { '*': 'left', '/': 'left', '%': 'left' },
    { '**': 'right' },
  ];
  return ops.map(op => {
    const k = OP_PREC.findIndex(it => it[op]);
    return prec[OP_PREC[k][op]](k+1, seq(left, op, right));
  });
}
