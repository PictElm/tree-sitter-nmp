;; textobjects querries for Helix editor

(operation_specification
  (and_operation_specification
    (attributes) @function.inside)) @function.around
(mode_specification
  (and_mode_specification
    (attributes) @class.inside)) @class.around
(extend_specification
  (attributes) @class.inside) @class.around

(comment) @comment.inside
(comment)+ @comment.around
