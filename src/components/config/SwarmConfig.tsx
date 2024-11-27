'use client';

import { useState } from 'react';
import ConfigPanel from './ConfigPanel';
import { AgentCapability } from '@/types/swarm';
import { CircuitBreakerConfig } from '@/utils/CircuitBreaker';

interface SwarmConfigProps {
  onConfigUpdate: (config: SwarmConfiguration) => void;
  initialConfig?: Partial<SwarmConfiguration>;
}

interface SwarmConfiguration {
  maxAgents: number;
  defaultTimeout: number;
  circuitBreaker: CircuitBreakerConfig;
  requiredCapabilities: AgentCapability[];
}

const DEFAULT_CONFIG: SwarmConfiguration = {
  maxAgents: 5,
  defaultTimeout: 30000,
  circuitBreaker: {
    failureThreshold: 3,
    resetTimeout: 60000,
  },
  requiredCapabilities: [
    AgentCapability.TASK_EXECUTION,
    AgentCapability.PLANNING,
  ],
};

export default function SwarmConfig({ 
  onConfigUpdate, 
  initialConfig = {} 
}: SwarmConfigProps) {
  const [config, setConfig] = useState<SwarmConfiguration>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const handleChange = (field: keyof SwarmConfiguration, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  const handleCircuitBreakerChange = (field: keyof CircuitBreakerConfig, value: number) => {
    const newConfig = {
      ...config,
      circuitBreaker: {
        ...config.circuitBreaker,
        [field]: value,
      },
    };
    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  return (
    <ConfigPanel title="Swarm Configuration">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Max Agents
          </label>
          <input
            type="number"
            value={config.maxAgents}
            onChange={(e) => handleChange('maxAgents', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Default Timeout (ms)
          </label>
          <input
            type="number"
            value={config.defaultTimeout}
            onChange={(e) => handleChange('defaultTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-200">Circuit Breaker</h3>
          <div className="space-y-4 pl-4">
            <div>
              <label className="block text-sm text-gray-300">
                Failure Threshold
              </label>
              <input
                type="number"
                value={config.circuitBreaker.failureThreshold}
                onChange={(e) => handleCircuitBreakerChange('failureThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">
                Reset Timeout (ms)
              </label>
              <input
                type="number"
                value={config.circuitBreaker.resetTimeout}
                onChange={(e) => handleCircuitBreakerChange('resetTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Required Capabilities
          </label>
          <div className="space-y-2">
            {Object.values(AgentCapability).map((capability) => (
              <label key={capability} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.requiredCapabilities.includes(capability)}
                  onChange={(e) => {
                    const newCapabilities = e.target.checked
                      ? [...config.requiredCapabilities, capability]
                      : config.requiredCapabilities.filter((cap) => cap !== capability);
                    handleChange('requiredCapabilities', newCapabilities);
                  }}
                  className="rounded border-gray-700 bg-gray-800"
                />
                <span className="text-sm text-gray-300">{capability}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </ConfigPanel>
  );
} 