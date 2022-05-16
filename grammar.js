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
    [$.location, $.reference_expression],
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
      $.canon_function_declaration,
      $.canon_procedure_declaration,
      $.canon_variable_declaration,
      $.top_level_selection,
      $.macro_directive,
      $.include_directive,
      $.delayed_include_directive,
      $.other_directive,
    ),

    type_specification: $ => seq(
      'type', $.identifier,
      '=', $.type_expression,
    ),
    let_specification: $ => seq(
      'let', optional('*'), $.identifier,
      optional(seq(':', $.type_expression)),
      '=', $.expression,
    ),
    register_specification: $ => seq(
      'reg', field('id', $.identifier),
      $.reg_part,
      optional($.attributes),
    ),
    memory_specification: $ => seq(
      'mem', field('id', $.identifier),
      $.mem_part,
      optional($.attributes),
    ),
    variable_specification: $ => seq(
      'var', field('id', $.identifier),
      $.reg_part,
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
    canon_function_declaration: $ => seq(
      'canon', $.type_expression, $.string,
      $.type_list,
    ),
    canon_procedure_declaration: $ => seq(
      'canon', $.string,
      $.type_list,
    ),
    canon_variable_declaration: $ => seq(
      'canon', $.type_expression, $.string,
    ),
    top_level_selection: $ => seq(
      'if', $.expression,
      'then', repeat($.specification),
      optional(seq('else', repeat($.specification))),
      'endif',
    ),
    other_directive: $ => seq('#', token.immediate(/[a-zA-Z_][a-zA-Z_0-9]*/), /.*/),

    reg_part: $ => seq('[', optional(seq(field('size', $.expression), ',')), field('type', $.type_expression), ']'),
    mem_part: $ => seq('[', field('size', $.expression), optional(seq(',', field('type', $.type_expression))), ']'),

    type_list: $ => seq('(', repeatSep($.type_expression, ','), ')'),

    attributes: $ => repeat1($.attribute),
    attribute: $ => choice(
      seq('__attr', '(', $.identifier, ')'), // XXX: no longer a real thing, but still appears in older examples as well as in the lexer
      seq($.identifier, '=', choice($.location, $.expression, $.block))
    ),
    block: $ => seq('{', optional($.sequence), '}'),

    location: $ => choice(
      seq(
        field('id', $.identifier),
        optional(choice(
          $.index_part,
          $.bit_field_part,
        )),
      ),
      prec.left(seq($.location, '::', $.location)),
    ),

    index_part: $ => seq('[', field('index', $.expression), ']'),
    bit_field_part: $ => seq('<', field('up', $.expression), '..', field('low', $.expression), '>'),

    parameter: $ => seq($.identifier, ':', $.type_expression),
    parameters: $ => seq('(', repeatSep($.parameter, ','), ')'),
    arguments: $ => seq('(', repeatSep($.expression, ','), ')'),

    or_operation_specification: $ => seq(
      'op', field('id', $.identifier),
      '=', repeatSep1($.identifier, '|'),
    ),
    and_operation_specification: $ => seq(
      'op', field('id', $.identifier),
      $.parameters,
      optional($.attributes),
    ),
    or_mode_specification: $ => seq(
      'mode', field('id', $.identifier),
      '=', repeatSep1($.identifier, '|'),
    ),
    and_mode_specification: $ => seq(
      'mode', field('id', $.identifier),
      $.parameters,
      '=', $.expression,
      optional($.attributes),
    ),

    // allow for '#' directives (eg. as result from preprocessing)
    sequence: $ => repeat1(choice(
      $.statement,
      $.other_directive,
    )),
    statement: $ => seq(choice(
      $.action_statement,
      $.assignment_statement,
      $.conditional_statement,
      $.switch_statement,
      $.canon_statement,
      $.error_statement,
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
      'switch', field('c', $.parenthesized_expression),
      $.switch_body,
    ),
    canon_statement: $ => seq($.string, $.arguments),
    error_statement: $ => seq('error', '(', choice($.string, $.identifier, $.call_expression), ')'),
    call_statement: $ => seq($.identifier, $.arguments),
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

    switch_body: $ => seq('{', repeat($.case), optional($.default), '}'),
    case: $ => seq('case', field('v', $.expression), ':', field('r', $.expression)),
    default: $ => seq('default', ':', field('r', $.expression)),

    expression: $ => choice(
      $.constant_expression,
      $.reference_expression,
      $.canon_expression,
      $.call_expression,
      $.dotted_expression,
      $.unary_expression,
      $.binary_expression,
      $.bit_field_expression,
      $.concat_expression,
      $.format_expression,
      $.if_expression,
      $.switch_expression,
      $.parenthesized_expression,
    ),
    constant_expression: $ => $.litteral,
    reference_expression: $ => seq($.identifier, optional($.index_part)),
    canon_expression: $ => seq($.string, $.arguments),
    call_expression: $ => seq($.identifier, $.arguments),
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
    bit_field_expression: $ => prec(42, seq($.expression, $.bit_field_part)),
    concat_expression: $ => binOpsWithPrec($.expression, ['::'], $.expression)[0],
    format_expression: $ => seq('format', $.format_expression_arguments),
    format_expression_arguments: $ => seq(
      '(', choice($.string, $.identifier, $.call_expression), repeat1(seq(',', $.expression)), ')',
    ),
    if_expression: $ => seq(
      'if', field('c', $.expression),
      'then', field('t', $.expression),
      'else', field('e', $.expression),
      'endif',
    ),
    switch_expression: $ => seq(
      'switch', field('c', $.parenthesized_expression),
      $.switch_body,
    ),
    parenthesized_expression: $ => seq('(', $.expression, ')'),
    arithmetic_expression: $ => choice(...binOpsWithPrec($.expression, ['+', '-', '*', '/', '%', '**'], $.expression)),
    comparison_expression: $ => choice(...binOpsWithPrec($.expression, ['==', '!=', '<', '<=', '>', '>='], $.expression)),
    logical_expression: $ => choice(...binOpsWithPrec($.expression, ['&&', '||'], $.expression)),
    bit_operation: $ => choice(...binOpsWithPrec($.expression, ['&', '|', '^'], $.expression)),
    shift_operation: $ => choice(...binOpsWithPrec($.expression, ['<<', '>>', '<<<', '>>>'], $.expression)),
    coerce_expression: $ => seq('coerce', $.type_coerce_part),
    type_coerce_part: $ => seq('(', $.type_expression, ',', $.expression, ')'),

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
    int_type: $ => seq('int', '(', field('N', $.expression), ')'),
    card_type: $ => seq('card', '(', field('N', $.expression), ')'),
    fix_type: $ => seq('fix', '(', field('I', $.expression), ',', field('F', $.expression), ')'),
    float_type: $ => seq('float', '(', field('M', $.expression), ',', field('E', $.expression), ')'),
    range_type: $ => seq('[', field('L', $.expression), '..', field('U', $.expression), ']'),
    enum_type: $ => seq('enum', '(', repeatSep1($.enum_value, ','), ')'),
    named_type: $ => $.identifier,

    enum_value: $ => choice(
      $.expression,
      seq($.expression, '..', $.expression),
    ),

    macro_directive: $ => seq(
      'macro', $.identifier,
      optional($.macro_parameters),
      '=', optional(alias(/([^\n]|\\\r?\n)*/, $.body)), optional('\n'),
    ),
    macro_parameters: $ => seq('(', repeatSep($.identifier, ','), ')'),
    include_directive: $ => seq('include', $.string),
    delayed_include_directive: $ => seq('include', optional(choice('-', '_')), 'op', $.string),

    identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/,

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
      seq('/*', /(\*[^\/]|[^*])*/, '*/'),
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
  // index in table is precedence
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
