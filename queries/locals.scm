[
  (top_level)
  (operation_specification)
  (mode_specification)
  (top_level_selection)
  (macro_directive)
  (top_level_selection)
  (conditional_statement)
  (switch_statement)
  (for_statement)
  (if_expression)
  (switch_expression)
] @local.scope

(let_specification
  (identifier) @local.definition)
(register_specification
  (identifier) @local.definition)
(memory_specification
  (identifier) @local.definition)
(variable_specification
  (identifier) @local.definition)
(parameter
  (identifier) @local.definition)
(let_statement
  (identifier) @local.definition)
(for_statement
  (identifier) @local.definition)

(identifier) @local.reference
