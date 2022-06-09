(operation_specification
  (and_operation_specification
    (attributes) @function.inside)) @function.around
(mode_specification
  (and_mode_specification
    (attributes) @class.inside)) @class.around
(extend_specification
  (attributes) @class.inside) @class.around

(format_expression_arguments
  (_) @parameter.inside)
(arguments
  (expression) @parameter.inside)
(parameter) @parameter.inside

(comment) @comment.inside
(comment)+ @comment.around
