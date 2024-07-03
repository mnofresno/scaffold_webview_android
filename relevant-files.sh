#!/bin/bash

# Número de archivos más modificados que queremos listar
TOP_N=10

# Archivo de salida para el prompt generado
OUTPUT_FILE="prompt.txt"

# Variable de entorno con archivos a excluir (separados por comas)
EXCLUDE_FILES=${EXCLUDE_FILES:-}

# Convertir la lista de archivos a excluir en un array
IFS=',' read -r -a exclude_array <<< "$EXCLUDE_FILES"

# Función para verificar si un archivo está en la lista de exclusión
is_excluded() {
  local file=$1
  for exclude in "${exclude_array[@]}"; do
    if [[ "$file" == "$exclude" ]]; then
      return 0
    fi
  done
  return 1
}

# Listar los archivos no ignorados por Git y contar las modificaciones, excluyendo los archivos especificados
echo "Generando lista de archivos más modificados..."
files=$(git ls-tree -r HEAD --name-only | while read filename; do
  if ! is_excluded "$filename"; then
    count=$(git log --pretty=format: --name-only -- "$filename" | grep -c "$filename")
    echo "$count $filename"
  fi
done | sort -nr | head -n $TOP_N)

# Generar el contenido del prompt
echo "Generando el prompt..."
echo "Los $TOP_N archivos más modificados en el proyecto son:" > $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Añadir la lista de archivos y sus contenidos al archivo de salida
while read line; do
  file=$(echo $line | cut -d' ' -f2-)
  echo "- $file" >> $OUTPUT_FILE
  echo "" >> $OUTPUT_FILE
  echo "Contenido de $file:" >> $OUTPUT_FILE
  echo "---------------------" >> $OUTPUT_FILE
  cat $file >> $OUTPUT_FILE
  echo "" >> $OUTPUT_FILE
  echo "" >> $OUTPUT_FILE
done <<< "$files"

# Añadir sección para pedido de modificación
echo "---------------------" >> $OUTPUT_FILE
echo "Pedido de modificación:" >> $OUTPUT_FILE
echo "---------------------" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Por favor, añade tu pedido de modificación aquí." >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "Prompt generado en $OUTPUT_FILE"

# Mostrar el contenido del prompt generado (opcional)
cat $OUTPUT_FILE
