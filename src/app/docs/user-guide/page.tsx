'use client';

export default function UserGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-orange-500 mb-8">Wire Loop User Guide</h1>
      
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Getting Started</h2>
          <p className="text-orange-200/80">
            Wire Loop is an advanced AI agent swarm platform that enables collaborative problem-solving through multiple specialized AI agents.
            Each agent has specific capabilities and can work together to accomplish complex tasks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Key Components</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Agent Swarm</h3>
              <p className="text-orange-200/80">
                A collection of specialized AI agents that work together. Each agent has specific capabilities and can:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Execute specialized tasks</li>
                <li>Collaborate with other agents</li>
                <li>Handle task handoffs</li>
                <li>Adapt to changing requirements</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Model Context Protocol (MCP)</h3>
              <p className="text-orange-200/80">
                The communication system that enables agents to share context and collaborate effectively:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Efficient context sharing</li>
                <li>Structured communication patterns</li>
                <li>Memory management</li>
                <li>State synchronization</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Runtime Environment</h3>
              <p className="text-orange-200/80">
                The execution environment where agents operate:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Task scheduling and execution</li>
                <li>Resource management</li>
                <li>Error handling and recovery</li>
                <li>Performance monitoring</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Using the Platform</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Creating Tasks</h3>
              <p className="text-orange-200/80">
                Tasks can be created through the UI or API. Each task should include:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Clear description and requirements</li>
                <li>Required capabilities</li>
                <li>Priority level</li>
                <li>Deadline (if applicable)</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-orange-500/20">
              <h3 className="text-xl font-medium text-orange-500 mb-2">Monitoring Progress</h3>
              <p className="text-orange-200/80">
                Track task progress and agent performance through:
              </p>
              <ul className="list-disc list-inside mt-2 text-orange-200/80 space-y-2">
                <li>Real-time status updates</li>
                <li>Agent activity logs</li>
                <li>Performance metrics</li>
                <li>Task completion reports</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-orange-500">Best Practices</h2>
          <ul className="list-disc list-inside text-orange-200/80 space-y-2">
            <li>Break complex tasks into smaller subtasks</li>
            <li>Specify clear requirements and constraints</li>
            <li>Monitor agent performance and adjust as needed</li>
            <li>Use appropriate priority levels for tasks</li>
            <li>Review task results and provide feedback</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 