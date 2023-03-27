import fs from "fs";

const version = "1.52.17.5"
const WAR_DIR_PREFIX = `raw/${version}/`

const allBluePrintFiles = deepScanDir(`${WAR_DIR_PREFIX}War/Content/Blueprints`)

const properties = {}
const dataTables = {}

const IGNORE_TYPES = [
  'ArrowComponent', 'AudioComponent', 'CameraComponent', 'CurveFloat', 'DelegateProperty', 'ParticleSystemComponent',
  'PointLightComponent', 'SceneComponent', 'SCS_Node', 'SimpleConstructionScript', 'StaticMeshComponent',
  'StealthComponent', 'TimelineTemplate', 'BlueprintGeneratedClass', 'BoxComponent', 'SkeletalMeshComponent',
  'ObjectProperty', 'DecalComponent', 'MultiplexedStaticMeshComponent', 'LocationMultiplexedMeshComponent',
  'TeamFlagMeshComponent', 'PlayerCameraRigComponent', 'IntProperty', 'Function', 'BoolProperty', 'CapsuleComponent',
  'InheritableComponentHandler', 'PayloadInstancedStaticMeshComponent', 'SpotLightComponent', 'SplineConnectorComponent',
  'BuildSocketComponent', 'BPStructurePipelineInput_C', 'BPStructurePipelineOutput_C', 'FacilityLightComponent',
  'WarAudioComponent',
]
const IGNORE_PROPS = [
  'CodeName', 'BuildOffset', 'SimpleConstructionScript', 'ArrowComponent', 'UseAreaBox', 'RootComponent',
  'BoxExtent', 'AreaClass', 'BodyInstance', 'RelativeLocation', 'AttachParent', 'ComponentClass',
  'ComponentTemplate', 'VariableGuid', 'InternalVariableName', 'ParentComponentOrVariableName',
  'RootNodes', 'StealthComponent', 'AnimClass', 'AnimationData',  'ClothingSimulationFactory',
  'SkeletalMesh', 'OverrideMaterials', 'RelativeRotation', 'UberGraphFrame', 'RelativeScale3D',
  'ShotSoundCue', 'Icon', 'ItemMesh', 'ItemBox', 'DeploySound', 'ActivityStateInfos', 'AttachedItemMesh',
  'GroundItemMesh', 'ReloadSoundCue', 'Mesh', 'PrimaryComponentTick', 'ExplosionOffsetZ', 'GroundItemOffset',
  'CollisionComp', 'MeshOffset', 'MeshRotation', 'FlameStreamFX', 'FlameBurstFX', 'FlameIdleFX', 'IdleFlameFXOffset',
  'WeaponShotSFX', 'OnComponentBeginOverlap', 'OnComponentEndOverlap', 'DestroyedFX', 'DestroyedSoundCue',
  'TriggerBoxOffset', 'TriggerBoxExtents', 'ObstructionCheckOverrideExtents', 'MeshStops', 'Team0Mesh', 'Team1Mesh',
  'TemplateActor', 'ImpactEffect', 'WeaponFireFXClass', 'MuzzleFlashPS', 'MuzzleFlashLocationComponent', 'FlagMesh',
  'ObstructionCheckOverrideExtents', 'SplineConnector', 'BackSocket', 'FrontSocket', 'BackSwitch',
  'FrontSwitch', 'BackSwitchMesh', 'FrontSwitchMesh', 'SnappablePathSocketClass', 'SocketTags',
  'MeshConfigs', 'DisabledTurretFX', 'DisabledTurret2FX', 'DisabledTurret3FX', 'DisabledFuelTankFX',
  'IdleLoop', 'RearLeftTireDirtLowSpeedPS', 'RearLeftTireDirtHighSpeedPS', 'RearRightTireDirtLowSpeedPS',
  'RearRightTireDirtHighSpeedPS', 'MainDirtLowSpeedPS', 'MainDirtHighSpeedPS', 'SkiddingDirtPS',
  'DestroyedMesh', 'MinorDamagePS', 'MajorDamagePS', 'DriveLoop', 'BackUpSFXLoop',
  'CameraRigComponent', 'FrontAxleCastLocation', 'RearAxleCastLocation', 'FrontLeftRollCastLocation',
  'FrontRightRollCastLocation', 'LeftSideTrackLocation', 'RightSideTrackLocation', 'VehicleCollision',
  'PassengerArea', 'MuzzleInfo', 'CapsuleComponent', 'Records', 'DriveLoopPitchCurve',
  'BreakdownSoundCue', 'CharatcerHitSound', 'EnvironmentHitSound', 'LockSound', 'Horn',
  'TreadInfo', 'BoostSoundCue', 'EnterSFX', 'FrontCoupler', 'RearCoupler', 'CouplerCableMaterial',
  'BrakeLoop', 'FrontClacks', 'RearClacks', 'FrictionForceCurve', 'BrakingFrictionForceCurve', 'ChainVisualOffset',
  'StaticMesh', 'LinearSpeedToTurnSpeedMapCurve', 'PackagedMesh', 'BoomLocation', 'HammerLocation',
  'WorkSoundCue', 'WorkPS', 'Sound', 'LightComponent', 'PowerSocket', 'BuildSiteClass', 'BelowBlockingVolume',
  'AboveBlockingArea', 'SkelMesh', 'ResourceFieldMeshComponent', 'NoBuildVolume', 'ResourceFieldMesh1',
  'ResourceFieldMesh2', 'ResourceFieldMesh3', 'TripodMesh', 'PayloadMesh', 'HeightConfig',
  'SirenLoop', 'BaseMesh', 'RotationSFXLoop', 'FireShellParticleSystem', 'EjectShellParticleSystem',
  'GunMesh', 'BuildGhostClass', 'RuinedComponent', 'CraneSpawnLocationComponent', 'MeshComponent',
  'RopeMesh', 'ShippableCollision', 'ArmMovementSFXLoop', 'DeployingSFXLoop', 'PulleyMovementSFXLoop',
  'ExplosionTemplate', 'TeamFlagMeshComponent', 'DestroyedDamageExtent', 'KillVolume', "Components",
  'PinPullSound', 'ParticleComp', 'LoopingAudio', 'BackMuzzleFlashPS', 'FrontLeftWaterEmitter',
  'FrontRightWaterEmitter', 'BackRightWaterEmitter', 'BackLeftWaterEmitter', 'WakeWaterEmitter',
  'WaterDriveLoop', 'MachineGunMuzzleLocation', 'ArtilleryMuzzleLocation', 'FrontWakeWaterEmitter', 'BuildSpawnOffset',
  "PipeInput0", "PipeOutput0", 'GarageFootprintComponent', 'TransferLocation', 'DrivewayFootprintComponent',
  'HammerImpactEffect', 'SledgeImpactEffect', 'HighYieldEffect', 'ResourcePickupClass', 'BuildRotation',
  'FiringSound', 'FiringSFX', 'ParticleSystemOverrides', 'ExplosionSound', 'ExplosionLight', 'RoadPhysicalMaterials',
  'RadialHitImpact', 'ExplosionLightFadeOut', 'CameraShake', 'CameraShakeOuterRadius', 'TankArmourEffectBehaviour'
]

const INCLUDE_CLASSES = [
  'ExplosiveClass', 'ItemComponentClass', 'GrenadeClass', 'AITurretsController', 'BaseStructureClass',
  'MapIntelligenceSource', 'AFKTimeoutComponent', 'CharacterMovement', 'WorkVolume', 'GenericStockpileComponent',
  'DamageType', 'ResourceClass', 'SpecializedFactoryComponent', 'ReserveStockpileComponent', 'GarrisonComponent',
  'DataClass', 'CraneComponent', 'ExplosionClass', 'MountComponent', 'MapIntelligenceSourceComponent',
]

const INCLUDE_MULTI_CLASSES = [
  'ProjectileClasses'
]

const ALWAY_USE_PROPNAME = ['VehicleSeatComponent']

IGNORE_PROPS.push(...INCLUDE_CLASSES)
IGNORE_PROPS.push(...INCLUDE_MULTI_CLASSES)

const codeNameMapping = {}
const dataTableIncludes = {}
const superStructs = {}
const cachedFiles = {}

while (allBluePrintFiles.length > 0) {
  const fileName = allBluePrintFiles.shift()
  const warPath = fileName.replace(WAR_DIR_PREFIX, '')
  const fileNameParts = fileName.split('/').slice(5)
  const BPType = fileNameParts.length > 1 ? fileNameParts.shift() : 'Common'
  const content = warPath in cachedFiles ? cachedFiles[warPath] : JSON.parse(fs.readFileSync(fileName));
  if (!(warPath in cachedFiles)) {
    cachedFiles[warPath] = content
  }
  const codeNames = []
  if (warPath in codeNameMapping) {
    codeNames.push(...codeNameMapping[warPath])
    delete codeNameMapping[warPath]
  }
  for (const section of content) {
    if (section?.Properties?.CodeName) {
      codeNames.push(['', section?.Properties?.CodeName])
    }
    if (section.Type === 'DataTable') {
      for (const row of Object.keys(section.Rows)) {
        if (row in dataTables) {
          dataTables[row].files.push(warPath)
          for (const key of Object.keys(section.Rows[row])) {
            if (key in dataTables[row]) {
              if (dataTables[row].files[0] === 'War/Content/Blueprints/Data/BPStructureDynamicData.json' &&
                dataTables[row].files[1] === 'War/Content/Blueprints/Data/BPVehicleDynamicData.json'
              ) {
                dataTables[row][key] = section.Rows[row][key]
              }
              else {
                console.log('already defined', row, key, dataTables[row][key], section.Rows[row][key], dataTables[row].files)
              }
            }
            else {
              dataTables[row][key] = section.Rows[row][key]
            }
          }
        }
        else {
          dataTables[row] = section.Rows[row]
          dataTables[row].files = [warPath]
        }
        if (section.Rows[row].DamageType?.ObjectPath) {
          const linkFileName = getScriptNameFromPath(section.Rows[row].DamageType?.ObjectPath, warPath)
          if (linkFileName) {
            if (!(linkFileName in dataTableIncludes)) {
              dataTableIncludes[linkFileName] = []
              if (!(linkFileName in codeNameMapping)) {
                codeNameMapping[linkFileName] = []
              }
              codeNameMapping[linkFileName].push(['', section.Rows[row].DamageType?.ObjectName])
              allBluePrintFiles.push(`${WAR_DIR_PREFIX}${linkFileName}`)
            }
            dataTableIncludes[linkFileName].push([row, section.Rows[row].DamageType?.ObjectName, 'DamageType'])
          }
          delete dataTables[row].DamageType
        }
      }
    }
  }
  if (warPath in superStructs) {
    codeNames.push(superStructs[warPath])
  }
  if (codeNames.length === 0) {
    continue
  }
  for (const codeNameArr of codeNames) {
    const propPrefix = codeNameArr[0]
    const codeName = codeNameArr[1]
    if (!(codeName in properties)) {
      properties[codeName] = {
        BPTypes: [],
        files: [],
        SuperStruct: [],
        processedSuperStruct: [],
        unprocessedSuperStruct: [],
        types: {},
      }
    }
    properties[codeName].BPTypes.push(BPType)
    if (properties[codeName].files.includes(warPath)) {
      continue
    }
    properties[codeName].files.push(warPath)
    for (const section of content) {
      if (section?.SuperStruct?.ObjectPath) {
        const linkFileName = getScriptNameFromPath(section.SuperStruct.ObjectPath, warPath)
        if (linkFileName) {
          if (!properties[codeName].SuperStruct.includes(linkFileName)) {
            properties[codeName].SuperStruct.push(linkFileName)
          }
          if (!(section.SuperStruct.ObjectName in superStructs)) {
            superStructs[linkFileName] = ['', section.SuperStruct.ObjectName]
            allBluePrintFiles.push(`${WAR_DIR_PREFIX}${linkFileName}`)
          }
        }
        delete section.SuperStruct
      }
      if (IGNORE_TYPES.includes(section.Type)) {
        continue
      }
      if (!(section.Type in properties[codeName].types)) {
        properties[codeName].types[section.Type] = 0
      }
      properties[codeName].types[section.Type]++
      if (section?.Properties) {
        for (const prop of Object.keys(section.Properties)) {
          if (section.Properties[prop] === null) {
            continue
          }
          const propName = `${propPrefix}${section.Type}[${properties[codeName].types[section.Type]}].${prop}`
          if (!IGNORE_PROPS.includes(prop)) {
            let value;
            switch (prop) {
              case 'DisplayName':
              case 'Description':
              case 'ChassisName':
                value = section.Properties[prop].LocalizedString
                break;

              case 'DescriptionDetails':
                value = section.Properties[prop]?.Text ? section.Properties[prop].Text.LocalizedString : section.Properties[prop].LocalizedString
                break;

              case 'Modifications':
                value = []
                for (const mods of section.Properties[prop]) {
                  for (let mod of Object.keys(mods)) {
                    mod = {
                      type: mod,
                      ...mods[mod]
                    }
                    delete mod.Icon

                    value.push(mod)
                  }
                }
                break;

              case 'Layouts':
                value = {}
                for (const layout of section.Properties[prop]) {
                  for (const item of Object.keys(layout)) {
                    value[item] = {
                      MaxAmount: layout[item].MaxAmount
                    }
                  }
                }
                break;

              case 'NoBuildPhysicalMaterials':
                value = [];
                for (const item of section.Properties[prop]) {
                  value.push(item.ObjectName.match(/PhysicalMaterial'(\w+)'/)[1])
                }
                break;

              default:
                value = section.Properties[prop]
                break;
            }
            if (!(prop in properties[codeName]) && !ALWAY_USE_PROPNAME.includes(section.Type)) {
              properties[codeName][prop] = value
            }
            else {
              if (!(propName in properties[codeName])) {
                properties[codeName][propName] = value
              }
              else {
                if (!(`${propName}_array` in properties[codeName])) {
                  properties[codeName][`${prop}_array`] = []
                }
                properties[codeName][`${prop}_array`].push(value)
              }
            }
          }
          const links = []
          if (INCLUDE_CLASSES.includes(prop)) {
            links.push([propName, section.Properties[prop].ObjectPath])
          }
          if (INCLUDE_MULTI_CLASSES.includes(prop)) {
            for (const link of section.Properties[prop]) {
              links.push([propName, link.ObjectPath])
            }
          }
          if (links.length > 0) {
            for (const link of links) {
              const linkFileName = getScriptNameFromPath(link[1], warPath)
              if (!linkFileName) {
                continue
              }
              if (!(linkFileName in codeNameMapping)) {
                codeNameMapping[linkFileName] = []
              }
              codeNameMapping[linkFileName].push([link[0] + '.', codeName])
              if (!allBluePrintFiles.includes(`${WAR_DIR_PREFIX}${linkFileName}`)) {
                allBluePrintFiles.push(`${WAR_DIR_PREFIX}${linkFileName}`)
              }
            }
          }
        }
      }
    }
  }
}

for (const codeName of Object.keys(properties)) {
  const prop = properties[codeName]
  while (prop.SuperStruct.length > 0) {
    const superStruct = prop.SuperStruct.shift()
    if (superStruct in superStructs) {
      prop.processedSuperStruct.push(superStruct)
      for (const key of Object.keys(properties[superStructs[superStruct][1]])) {
        if (!(key in prop)) {
          prop[key] = properties[superStructs[superStruct][1]][key]
        }
      }
      if (properties[superStructs[superStruct][1]].SuperStruct.length > 0) {
        prop.SuperStruct.push(...properties[superStructs[superStruct][1]].SuperStruct)
      }
    }
    else {
      prop.unprocessedSuperStruct.push(superStruct)
      console.log('unknown superstruct', codeName, superStruct)
    }
  }
  prop.SuperStruct = prop.processedSuperStruct;
  delete prop.processedSuperStruct
}

for (const includes of Object.values(dataTableIncludes)) {
  for (const include of includes) {
    if (!(include[1] in properties)) {
      console.log('Missing', include)
      continue
    }
    for (const key of Object.keys(properties[include[1]])) {
      if (!(include[2] in dataTables[include[0]])) {
        dataTables[include[0]][include[2]] = {}
      }
      if (key in dataTables[include[0]][include[2]]) {
        if (key === 'files') {
          dataTables[include[0]][include[2]][key].push(...properties[include[1]][key])
        }
        else {
          console.log('already defined2', key, include)
        }
      }
      else {
        dataTables[include[0]][include[2]][key] = properties[include[1]][key]
      }
    }
  }
}

for (const includes of Object.values(dataTableIncludes)) {
  for (const include of includes) {
    if (properties[include[1]]) {
      delete properties[include[1]]
    }
  }
}

for (const codeName of Object.keys(properties)) {
  const prop = properties[codeName]
  if (codeName in dataTables) {
    for (const key of Object.keys(dataTables[codeName])) {
      if (key in prop) {
        if (key === 'files' || key === 'BPTypes' || key === 'SuperStruct' || key === 'unprocessedSuperStruct' || key === 'types') {
          prop[key].push(...dataTables[codeName][key])
        }
        else if (prop[key] !== dataTables[codeName][key]) {
          if (`dataTable.${key}` in prop) {
            console.log('key already exists datatable', key, codeName, prop[key], dataTables[codeName][key])
          }
          else {
            prop[`dataTable.${key}`] = dataTables[codeName][key]
          }
        }
      }
      else {
        prop[key] = dataTables[codeName][key]
      }
    }
  }
  for (const key of Object.keys(prop)) {
    if (key !== 'CodeName' && key.endsWith('CodeName')) {
      if (prop[key] in dataTables) {
        prop.files.push(...dataTables[prop[key]].files)
        prop[key + 'Data'] = {...dataTables[prop[key]]}
        delete prop[key + 'Data'].files
      }
      else {
        console.log('unknown datatable', key, prop[key])
      }
    }
  }
}

for (const superStruct of Object.values(superStructs)) {
  delete properties[superStruct[1]]
}

console.log('missing mapping', codeNameMapping)
fs.writeFileSync('datatables.json', JSON.stringify(dataTables, null, 2))
fs.writeFileSync('basic.json', JSON.stringify(properties, null, 2))


function getScriptNameFromPath(link, warPath) {
  let linkFileName = link.slice(0, link.lastIndexOf('.')) + '.json'
  if (linkFileName === warPath || linkFileName.startsWith('/Script')) {
    return false
  }
  return linkFileName
}

function deepScanDir(dir) {
  const files = []
  for (const file of fs.readdirSync(dir)) {
    const path = `${dir}/${file}`
    if (fs.lstatSync(path).isDirectory()) {
      files.push(...deepScanDir(path));
    }
    else {
      files.push(path)
    }
  }
  return files
}