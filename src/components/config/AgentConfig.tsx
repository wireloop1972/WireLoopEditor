'use client';

import { useState } from 'react';
import ConfigPanel from './ConfigPanel';
import { AgentCapability, AgentRole } from '@/types/swarm';

interface AgentConfigProps {
  onConfigUpdate: (config: AgentConfigurationType) => void;
  initialConfig?: Partial<AgentConfigurationType>;
}

interface AgentConfigurationType {
  role: AgentRole;
  maxLoad: number;
  priority: number;
}

const DEFAULT_AGENT_CONFIG: AgentConfigurationType = {
  role: {
    id: '',
    name: '',
    capabilities: [AgentCapability.TASK_EXECUTION],
    specialization: '',
    priority: 1,
    metadata: {},
    description: 'Default agent configuration'
  },
  maxLoad: 5,
  priority: 1,
};

export default function AgentConfig({
  onConfigUpdate,
  initialConfig = {},
}: AgentConfigProps) {
  const [config, setConfig] = useState<AgentConfigurationType>({
    ...DEFAULT_AGENT_CONFIG,
    ...initialConfig,
  });

  const handleChange = (field: keyof AgentConfigurationType, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  const handleRoleChange = (field: keyof AgentRole, value: any) => {
    const newConfig = {
      ...config,
      role: {
        ...config.role,
        [field]: value,
      },
    };
    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  return (
    <ConfigPanel title="Agent Configuration">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-200">Role Configuration</h3>
          <div className="space-y-4 pl-4">
            <div>
              <label className="block text-sm text-gray-300">Name</label>
              <input
                type="text"
                value={config.role.name}
                onChange={(e) => handleRoleChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">Specialization</label>
              <input
                type="text"
                value={config.role.specialization}
                onChange={(e) => handleRoleChange('specialization', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">Priority</label>
              <input
                type="number"
                value={config.role.priority}
                onChange={(e) => handleRoleChange('priority', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Capabilities</label>
              <div className="space-y-2">
                {Object.values(AgentCapability).map((capability) => (
                  <label key={capability} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.role.capabilities.includes(capability)}
                      onChange={(e) => {
                        const newCapabilities = e.target.checked
                          ? [...config.role.capabilities, capability]
                          : config.role.capabilities.filter((cap) => cap !== capability);
                        handleRoleChange('capabilities', newCapabilities);
                      }}
                      className="rounded border-gray-700 bg-gray-800"
                    />
                    <span className="text-sm text-gray-300">{capability}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Max Load
          </label>
          <input
            type="number"
            value={config.maxLoad}
            onChange={(e) => handleChange('maxLoad', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Priority
          </label>
          <input
            type="number"
            value={config.priority}
            onChange={(e) => handleChange('priority', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>
      </div>
    </ConfigPanel>
  );
} 