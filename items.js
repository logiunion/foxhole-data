import fs from "fs";
import {copyProperties} from "./common.js";

const all = JSON.parse(fs.readFileSync('basic.json'))
//const dataTable = JSON.parse(fs.readFileSync('datatables.json'))

const items = []
const todo = []

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

const codeNames = {}

for (const codeName of Object.keys(all)) {
  const dataItem = all[codeName]
  if (!dataItem.BPTypes.includes('Items') && !dataItem.BPTypes.includes('ItemPickups')) {
    continue
  }
  if (dataItem.BPTypes.includes('Vehicles')) { // || dataItem.BPTypes.includes('Structures')
    continue
  }
  if (!dataItem.ItemProfileType) {
    console.log('No type', codeName)
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

  codeNames[codeName] = items.push(item) - 1

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

for (const codeName of Object.keys(all)) {
  const dataItem = all[codeName]
  if (dataItem.ProductionCategories) {
    for (const category of dataItem.ProductionCategories) {
      for (const item of category.CategoryItems) {
        if (item.CodeName in codeNames) {
          if (!("ProducedIn" in items[codeNames[item.CodeName]])) {
            items[codeNames[item.CodeName]].ProducedIn = []
          }
          if (!items[codeNames[item.CodeName]].ProducedIn.includes(codeName)) {
            items[codeNames[item.CodeName]].ProducedIn.push(codeName)
          }
        }
      }
    }
  }
  if (dataItem.ConversionEntries) {
    for (const conversion of dataItem.ConversionEntries) {
      if (conversion.Output) {
        for (const output of conversion.Output) {
          if (output.CodeName in codeNames) {
            if (!("ProducedIn" in items[codeNames[output.CodeName]])) {
              items[codeNames[output.CodeName]].ProducedIn = []
            }
            if (!items[codeNames[output.CodeName]].ProducedIn.includes(codeName)) {
              items[codeNames[output.CodeName]].ProducedIn.push(codeName)
            }
          }
        }
      }
    }
  }
  if (dataItem.Modifications) {
    for (const mods of dataItem.Modifications) {
      if (mods.ConversionEntries) {
        for (const conversion of mods.ConversionEntries) {
          if (conversion.Output) {
            for (const output of conversion.Output) {
              if (output.CodeName in codeNames) {
                if (!("ProducedIn" in items[codeNames[output.CodeName]])) {
                  items[codeNames[output.CodeName]].ProducedIn = []
                }
                if (!items[codeNames[output.CodeName]].ProducedIn.includes(codeName)) {
                  items[codeNames[output.CodeName]].ProducedIn.push(codeName)
                }
              }
            }
          }
        }
      }
    }
  }
}

fs.writeFileSync('docs/items.json', JSON.stringify(items, null, 2))
fs.writeFileSync('items-todo.json', JSON.stringify(todo, null, 2))
console.log(todo.length)

function costPerCrate(item, values) {
  item.CostPerCrate = {}
  for (const value of values) {
    if (value.ItemCodeName === 'None') {
      continue
    }
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