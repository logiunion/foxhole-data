import fs from "fs";

const all = JSON.parse(fs.readFileSync('basic.json'))
const dataTable = JSON.parse(fs.readFileSync('datatables.json'))

const items = []
const todo = []

const damageTypes = new Set()

const copyProps = [
  'DisplayName', 'Description',
  {name: 'ItemCategory', replace: ['EItemCategory::', '']},
  {name: 'ItemProfileType', replace: ['EItemProfileType::', '']},
  'Encumbrance', 'EquippedEncumbrance',
  {name: 'EquipmentSlot', replace: ['EEquipmentSlot::', '']},
  {name: 'FactionVariant', replace: ['EFactionId::', '']},
  {name: 'TechID', replace: ['ETechID::', '']},
  {name: 'CostPerCrate', function: costPerCrate},
  'QuantityPerCrate', 'CrateProductionTime', 'SingleRetrieveTime', 'CrateRetrieveTime',
  {name: 'CompatibleAmmoNames', function: compatibleAmmoNames}, {name: 'MultiAmmo', function: compatibleAmmoNames},
  'Damage', 'DamageMultiplier', 'DestructibleDamage', 'Suppression', 'SuppressionMultiplier', 'ExplosionRadius',
  'DamageInnerRadius', 'DamageFalloff',
  'AccuracyRadius', 'EnvironmentImpactAmount', 'AddedBurning', 'AddedBurningMultiplier', 'AddedHeat',
  {name: 'DamageType', function: damageType},
  'MaxAmmo',
  {name: 'MaximumRange', merge: ['MaximumRange', 'GrenadeRangeLimit']},
  'MaximumReachability',
  {name: 'DeployDuration', merge: ['DeployDuration', 'GrenadeFuseTimer', 'FuseTimer']},
  'CoverProvided',
  'bPreventBorderPlacement', 'ShouldDoLandscapeCheck', 'bIsSingleUse', 'bIsLarge', 'bSupportsVehicleMounts',
  'bCanFireFromVehicle', 'bRequiresCoverOrLowStanceToInvoke'
]

const ignoreCostsProps = [
  'CostPerCrate', 'QuantityPerCrate', 'CrateProductionTime', 'SingleRetrieveTime', 'CrateRetrieveTime',
  'MaximumRange', 'MaximumReachability', 'AddedBurningMultiplier',
]

const damageTypeProps = [
  {name: 'DamageType', replace: ['EDamageType::', '']},
  {name: 'VehicleSubsystemOverride', replace: ['EVehicleSubsystem::', '']},
  'VehicleSubsystemDisableMultipliers', 'TankArmourPenetrationFactor',
  'bApplyTankArmourMechanics',
  'bApplyTankArmourAngleRangeBonuses',
  'bApplyDamageFalloff',
  'bCanWoundCharacter',
  'bCanRuinStructures',
  'bAppliesBurning',
  'bNeverAppliesBleeding',
  'bAlwaysAppliesBleeding',
]

for (const codeName of Object.keys(all)) {
  const dataItem = all[codeName]
  if (!dataItem.BPTypes.includes('Items') && !dataItem.BPTypes.includes('ItemPickups')) {
    continue
  }
  if (dataItem.BPTypes.includes('Vehicles') || dataItem.BPTypes.includes('Structures')) {
    continue
  }
  if (!dataItem.ItemProfileType) {
    console.log(dataItem)
    continue
  }

  const item = {
    CodeName: codeName,
  }

  copyProperties(item, dataItem, copyProps)
  if (dataItem.CompatibleAmmoCodeNameData) {
    copyProperties(item, dataItem.CompatibleAmmoCodeNameData, copyProps, ignoreCostsProps)
  }

  if (dataItem.SingleShotCodeNameData) {
    const singleShotItem = JSON.parse(JSON.stringify(item))
    singleShotItem.CodeName += 'Single'
    singleShotItem.DisplayName += ' (Single Shot)'
    copyProperties(singleShotItem, dataItem.SingleShotCodeNameData, copyProps, ignoreCostsProps, true)
    copyProperties(singleShotItem, dataItem.SingleShotAmmoCodeNameData, copyProps, ignoreCostsProps, true)
    items.push(singleShotItem)
  }

  items.push(item)

  delete dataItem.BPTypes
  delete dataItem.files
  delete dataItem.SuperStruct
  delete dataItem.unprocessedSuperStruct
  delete dataItem.types
  delete dataItem.ItemFlagsMask
  delete dataItem.ResearchLevel
  if (Object.keys(dataItem).length > 0) {
    dataItem.codeName = codeName
    dataItem.DisplayName = item.DisplayName
    todo.push(dataItem)
  }

}

fs.writeFileSync('public/items.json', JSON.stringify(items, null, 2))
fs.writeFileSync('items-todo.json', JSON.stringify(todo, null, 2))
console.log(todo.length)

function copyProperties(item, dataItem, copyProps, ignore = [], overwrite = false) {
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

function costPerCrate(item, values) {
  item.CostPerCrate = {}
  for (const value of values) {
    item.CostPerCrate[value.ItemCodeName] = value.Quantity
  }
}

function damageType(item, value) {
  copyProperties(item, value, damageTypeProps, [])
}

function compatibleAmmoNames(item, value) {
  if (!('CompatibleAmmoNames' in item)) {
    item.CompatibleAmmoNames = []
  }
  if (typeof value === 'object') {
    for (const ammo of value.CompatibleAmmoNames) {
      item.CompatibleAmmoNames.push(ammo)
    }
  }
  else {
    item.CompatibleAmmoNames.push(value)
  }
}