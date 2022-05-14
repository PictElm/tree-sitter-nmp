((identifier) @constant
  (#match? @constant "^[A-Z][A-Z_0-9]*$"))
(canon_variable_declaration
  ((string) @constant
    (#match? @constant "^\"[A-Z][A-Z_0-9]*\"$"))) ; that ever matches? (missing ""?)
(canon_variable_declaration
  (string) @variable)

(type_specification
  (identifier) @type)
(mode_specification
  (and_mode_specification
    (identifier) @type))
(extend_specification
  (identifier) @type) ; test with multiple

(operation_specification
  (and_operation_specification
    (identifier) @function))
(canon_function_declaration
  (string) @function)
(canon_procedure_declaration
  (string) @function)
(call_statement
  (identifier) @function)
(call_expression
  (identifier) @function)
(canon_statement
  (string) @function)
(canon_expression
  (string) @function)

(other_directive) @keyword

[
  "::"
  "||"
  "&&"
  "|"
  "^"
  "&"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "<<"
  ">>"
  "<<<"
  ">>>"
  "+"
  "-"
  "*"
  "/"
  "%"
  "**"
] @operator
  
[
  ";"
  "."
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  "__attr"
  "canon"
  "case"
  "coerce"
  "default"
  "do"
  "else"
  "enddo"
  "endif"
  "error"
  "extend"
  "for"
  "format"
  "if"
  "in"
  "include"
  "let"
  "macro"
  "mem"
  "mode"
  "op"
  "reg"
  "switch"
  "then"
  "type"
  "var"
] @keyword

(ERROR) @error
(comment) @comment

(boolean) @constant.builtin
(integer) @number
(real) @number
(string) @string

(identifier) @variable
(type_expression) @type
