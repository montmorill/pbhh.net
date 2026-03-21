import type { Capability } from 'server/modules/auth/model'

export const adminCapabilities = [
  'admin:view',
  'admin:edit',
  'admin:update',
] as const satisfies Capability[]

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

export function getEffectiveCapabilities(
  capabilities: readonly Capability[] | undefined,
): Capability[] {
  const effective = new Set<Capability>(capabilities ?? [])

  for (const capability of adminCapabilities) {
    if (hasCapability(capabilities, capability))
      effective.add(capability)
  }

  return [...effective]
}
