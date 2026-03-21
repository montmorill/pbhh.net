import type { Capability } from 'server/modules/auth/model'

function capabilityNamespace(capability: string) {
  return capability.split(':', 1)[0]!
}

export function hasCapability(
  capabilities: readonly string[] | undefined,
  required: Capability,
): boolean {
  if (!capabilities?.length)
    return false

  if (capabilities.includes(required))
    return true

  const namespace = capabilityNamespace(required)

  if (required.includes(':') && capabilities.includes(namespace))
    return true

  return capabilities.includes(`${namespace}:*`)
}
