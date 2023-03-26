export function copyProperties(item, dataItem, copyProps, ignore = [], overwrite = false) {
  for (let column of copyProps) {
    if (typeof column === 'string') {
      column = {name: column, merge: [column]}
    }
    if (ignore.includes(column.name)) {
      continue
    }
    if (column.merge) {
      for (const key of column.merge) {
        if (!(key in dataItem)) {
          continue
        }
        if (column.name in item && item[column.name] !== dataItem[key] && !overwrite) {
          console.log('different value for', item.CodeName, column.name, item[column.name], dataItem[key], ignore)
        }
        else {
          item[column.name] = dataItem[key]
        }
        delete dataItem[key]
      }
      continue
    }
    if (!(column.name in dataItem)) {
      continue
    }
    const value = dataItem[column.name]
    if (column.replace) {
      item[column.name] = value.replace(column.replace[0], column.replace[1])
    }
    else if (column.function) {
      column.function(item, value)
    }
    delete dataItem[column.name]
  }
}