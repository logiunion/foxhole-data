import fs from "fs";
import {copyProperties} from "./common.js";

const all = JSON.parse(fs.readFileSync('basic.json'))

const structures = []
const todo = []

const copyProps = [
  'DisplayName', 'Description',
  {name: 'FactionVariant', replace: ['EFactionId::', '']},
  'BuildOrder',
  {name: 'BuildCategory', replace: ['EBuildCategory::', '']},
  {name: 'BuildLocationType', replace: ['EBuildLocationType::', '']},
  'ValidBuildTools',
  {name: 'TechID', replace: ['ETechID::', '']},
  {name: 'ResourceAmounts', function: resourceAmounts}, {name: 'AltResourceAmounts', function: resourceAmounts},
  'MaxHealth', 'Health',
  'DecayStartHours', 'DecayDurationHours',
  'RepairCost', 'StructuralIntegrity',
  'DetectionRadius', {name: 'TunnelConnectionRange', merge: ['TunnelConnectionRange', 'BaseTunnelConnectionRange']},
  {name: 'PowerInfo', function: powerInfo},
  {name: 'ArmourType', replace: ['EArmourType::', '']},
  {name: 'BaseDamage', merge: ['BaseDamage', 'WeaponDamage']},
  'WeaponDamageAT',
  {name: 'MinimumRange', merge: ['MinDistance']},
  {name: 'MaximumRange', merge: ['MaximumRange', 'MaxDistance']},
  'MaximumReachability', 'FiringPeriod',
  'TrackingSpeed', 'DamageDelay',
  'TimeToFullFireRateAndAccuracy', 'EnemyPursueDuration', 'ShouldAggroOnDamage',
  {name: 'TankArmourEffectType', replace: ['ETankArmourEffectType::', '']},
  'VehicleSubsystemDisableMultipliers',
  'ConnectorMinLength', 'ConnectorMaxLength',
  'UpgradeStructureCodeName',
  {name: 'Items', function: techItems},
  {name: 'ProductionCategories', function: productionCategories},
  {name: 'ConversionEntries', function: conversionEntries},
  {name: 'Modifications', function: modifications},
  'FuelTanks',
  'IsVaultable', 'RamDamageReceivedFlags',
  'bCanBeHidden', 'bApplyTankArmourMechanics', 'bCanBeHarvested', 'bIsDamagedWhileDrivingOver', 'bLogWhenDestroyed',
  'bBuildOnBridges', 'bIsBuiltOnFoundation', 'bIsConnector', 'bIsManualConnector', 'bClearModificationsOnDowngrade',
  'bExposeInUI', 'bDropsLargeMaterialsWhenDestroyed', 'bIsGarrisonEnabled', 'CoverProvided', 'bIsRemovable'
]

const codeNames = {}

for (const codeName of Object.keys(all)) {
  const dataItem = all[codeName]
  if (!dataItem.BPTypes.includes('Structures')) {
    continue
  }
  if (dataItem.ItemProfileType) {
    continue
  }
  if (dataItem.bIsVehicleProxy) {
    continue
  }
  // if (dataItem.BPTypes.includes('Vehicles') || dataItem.BPTypes.includes('Structures')) {
  //   continue
  // }

  const item = {
    CodeName: codeName,
  }

  copyProperties(item, dataItem, copyProps)

  codeNames[codeName] = structures.push(item) - 1

  // delete dataItem.BPTypes
  delete dataItem.files
  delete dataItem.SuperStruct
  delete dataItem.unprocessedSuperStruct
  // delete dataItem.types
  if (Object.keys(dataItem).length > 0) {
    dataItem.codeName = codeName
    dataItem.DisplayName = item.DisplayName
    todo.push(dataItem)
  }

}

fs.writeFileSync('docs/structures.json', JSON.stringify(structures, null, 2))
fs.writeFileSync('structures-todo.json', JSON.stringify(todo, null, 2))
console.log(todo.length)

function resourceAmounts(item, value) {
  if (!('ResourceAmounts' in item)) {
    item.ResourceAmounts = []
  }
  const data = {}
  if (value.Resource.CodeName === 'None') {
    return
  }
  data[value.Resource.CodeName] = value.Resource.Quantity
  for (const other of value.OtherResources) {
    data[other.CodeName] = other.Quantity
  }
  item.ResourceAmounts.push(data)
}

function powerInfo(item, value) {
  item.Power = value.PowerDelta
  if (value.PowerLength) {
    item.PowerLength = value.PowerLength
  }
  if (value.MaxConnections) {
    item.PowerMaxConnections = value.MaxConnections
  }
}

function techItems(item, value) {
  item.Techs = []
  for (const tech of value) {
    item.Techs.push({
      TechID: tech.TechID.replace('ETechComponentID::', ''),
      Requirement: tech.Requirement,
      NextTechID: tech.NextTechID.replace('ETechComponentID::', '')
    })
  }
}

function productionCategories(item, value) {
  if (!('Production' in item)) {
    item.Production = []
  }
  for (const category of value) {
    for (const categoryItem of category.CategoryItems) {
      item.Production.push({
        'Item': categoryItem.CodeName,
        'Category': category.Type.replace('EFactoryQueueType::', ''),
      })
    }
  }
}

function conversionEntries(item, value, requiredModification = null) {
  for (const conversion of value) {
    if (conversion.Output) {
      const conversionData = {
        Input: [...conversion.Input, ...conversion.FuelInput],
        Output: [...conversion.Output, ...conversion.FuelOutput],
        Duration: conversion.Duration,
        Power: conversion.PowerDelta,
        bConsumeResourceNodes: conversion.bConsumeResourceNodes,
      }
      if (requiredModification) {
        conversionData.RequiredModification = requiredModification;
      }
      if (!('Conversions' in item)) {
        item.Conversions = []
      }
      item.Conversions.push(conversionData)
    }
  }
}

function modifications(item, value) {
  for (const mod of value) {
    if (mod.ConversionEntries) {
      conversionEntries(item, mod.ConversionEntries, mod.type.replace('EFortModificationType::', ''))
    }
    else {
      console.log(mod)
    }
  }
}