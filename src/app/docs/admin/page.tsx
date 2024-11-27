'use client';

export default function AdminGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Administrator Guide</h1>
      
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">System Architecture</h2>
          <p className="text-orange-200/80">
            Wire Loop uses a distributed architecture with multiple components working together to provide a scalable and reliable AI agent platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Configuration Management</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Swarm Configuration</h3>
              <p className="text-orange-200/80">
                Global settings that affect the entire agent swarm:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Maximum number of concurrent agents</li>
                <li>Default timeouts and retry settings</li>
                <li>Circuit breaker configuration</li>
                <li>Resource allocation limits</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Agent Configuration</h3>
              <p className="text-orange-200/80">
                Individual agent settings and capabilities:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Role and specialization settings</li>
                <li>Capability management</li>
                <li>Load balancing parameters</li>
                <li>Priority and resource limits</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Security</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">API Security</h3>
              <p className="text-orange-200/80">
                Security measures for API access:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>API key management</li>
                <li>Rate limiting configuration</li>
                <li>Access control settings</li>
                <li>Request validation rules</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Data Security</h3>
              <p className="text-orange-200/80">
                Data protection measures:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Encryption settings</li>
                <li>Data retention policies</li>
                <li>Backup configuration</li>
                <li>Audit logging</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Monitoring & Maintenance</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">System Monitoring</h3>
              <p className="text-orange-200/80">
                Tools and metrics for system health:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Performance metrics</li>
                <li>Resource utilization</li>
                <li>Error rates and alerts</li>
                <li>System health checks</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Maintenance Tasks</h3>
              <p className="text-orange-200/80">
                Regular maintenance procedures:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Backup and recovery</li>
                <li>Performance optimization</li>
                <li>System updates</li>
                <li>Log rotation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Troubleshooting</h2>
          <ul className="list-disc list-inside text-orange-200/80 space-y-2">
            <li>Common error scenarios and solutions</li>
            <li>Debugging tools and procedures</li>
            <li>Performance optimization tips</li>
            <li>Support escalation process</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 