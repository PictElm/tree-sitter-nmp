(ERROR) @error
(comment) @comment

(boolean) @constant.builtin
(integer) @number
(real) @number
(string) @string

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z\\d_]*$"))
(identifier) @variable

(type_expression) @type
(type_specification (identifier) @type)

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
  "canon"
  "case"
  "coerce"
  "default"
  "do"
  "else"
  "enddo"
  "endif"
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
