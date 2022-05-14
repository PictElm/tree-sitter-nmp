;; textobjects querries for Helix editor

(operation_specification
  (and_operation_specification
    (attributes) @function.inside)) @function.around
(mode_specification
  (and_mode_specification
    (attributes) @class.inside)) @class.around
(extend_specification
  (attributes) @class.inside) @class.around

(format_expression
  (_) @parameter.inside) ; YYY: could get rid of this
(arguments
  (expression) @parameter.inside)
(parameter) @parameter.inside

(comment) @comment.inside
(comment)+ @comment.around
