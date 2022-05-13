;; textobjects querries for Helix editor

(operation_specification
  (and_operation_specification
    (attributes) @function.inside)) @function.around
(mode_specification
  (and_mode_specification
    (attributes) @function.inside)) @function.around
(extend_specification
  (attributes) @function.inside) @function.around

(comment) @comment.inside
(comment)+ @comment.around
