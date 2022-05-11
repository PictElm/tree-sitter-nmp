module.exports = grammar({

  name: 'nmp',

  extras: $ => [
    $.comment,
    /\s+/,
  ],

  rules: {

    source_file: $ => repeat(/.*/),

    comment: $ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),

  },

});
