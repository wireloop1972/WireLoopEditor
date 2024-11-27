import { OptimizationRule, TaskContext, Subtask } from '@/types/task';

interface SubtaskMetadata {
  similarityGroup?: string;
  originalDescription?: string;
  suggestedOrder?: number;
  groupSize?: number;
  optimizationHistory?: string[];
}

/**
 * Combines similar subtasks to reduce overhead
 */
export const SubtaskMergeRule: OptimizationRule = {
  name: 'subtask-merge',
  description: 'Combines similar subtasks to reduce overhead',
  priority: 10,
  condition: (task) => task.subtasks.length > 1,
  optimize: async (task) => {
    const similarityThreshold = 0.7;
    const mergedSubtasks: Subtask[] = [];
    const processedIndices = new Set<number>();

    // Helper function to calculate similarity between two descriptions
    const calculateSimilarity = (desc1: string, desc2: string): number => {
      const words1 = new Set(desc1.toLowerCase().split(' '));
      const words2 = new Set(desc2.toLowerCase().split(' '));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      return intersection.size / union.size;
    };

    // Look for similar subtasks
    for (let i = 0; i < task.subtasks.length; i++) {
      if (processedIndices.has(i)) continue;

      const current = task.subtasks[i];
      const similar: Subtask[] = [current];
      processedIndices.add(i);

      // Find similar subtasks
      for (let j = i + 1; j < task.subtasks.length; j++) {
        if (processedIndices.has(j)) continue;

        const next = task.subtasks[j];
        const similarity = calculateSimilarity(
          current.description,
          next.description
        );

        if (similarity >= similarityThreshold) {
          similar.push(next);
          processedIndices.add(j);
        }
      }

      // If found similar tasks, merge them
      if (similar.length > 1) {
        const originalDescriptions = similar.map(s => s.description);
        const metadata: SubtaskMetadata = {
          similarityGroup: `group-${i}`,
          originalDescription: originalDescriptions.join(' | '),
          optimizationHistory: ['merged-similar-tasks'],
        };

        mergedSubtasks.push({
          ...current,
          description: `Combined task: ${originalDescriptions.join(' AND ')}`,
          estimatedComplexity: Math.max(
            ...similar.map(s => s.estimatedComplexity)
          ),
          requiredCapabilities: Array.from(
            new Set(
              similar.flatMap(s => s.requiredCapabilities)
            )
          ),
          metadata,
        });
      } else {
        mergedSubtasks.push({
          ...current,
          metadata: {
            ...current.metadata,
            optimizationHistory: ['kept-original'],
          },
        });
      }
    }

    return { 
      ...task, 
      subtasks: mergedSubtasks,
      metadata: {
        ...task.metadata,
        mergeOptimization: {
          originalCount: task.subtasks.length,
          mergedCount: mergedSubtasks.length,
          timestamp: new Date().toISOString(),
        },
      },
    };
  },
};

/**
 * Balances workload across available agents
 */
export const WorkloadBalanceRule: OptimizationRule = {
  name: 'workload-balance',
  description: 'Balances workload across available agents',
  priority: 8,
  condition: (task) => task.subtasks.length > 1,
  optimize: async (task) => {
    // Sort subtasks by complexity (descending)
    const sortedSubtasks = [...task.subtasks].sort(
      (a, b) => b.estimatedComplexity - a.estimatedComplexity
    );

    // Group subtasks by required capabilities
    const groupedSubtasks = sortedSubtasks.reduce((groups, subtask) => {
      const key = subtask.requiredCapabilities.sort().join(',');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(subtask);
      return groups;
    }, {} as Record<string, Subtask[]>);

    // Distribute subtasks evenly within each capability group
    const optimizedSubtasks = Object.values(groupedSubtasks).flatMap(group => {
      return group.map((subtask, index) => ({
        ...subtask,
        metadata: {
          ...subtask.metadata,
          suggestedOrder: index,
          groupSize: group.length,
          capabilityGroup: subtask.requiredCapabilities.sort().join(','),
          optimizationHistory: [
            ...(subtask.metadata?.optimizationHistory || []),
            'workload-balanced',
          ],
        } as SubtaskMetadata,
      }));
    });

    return { 
      ...task, 
      subtasks: optimizedSubtasks,
      metadata: {
        ...task.metadata,
        workloadOptimization: {
          groupCount: Object.keys(groupedSubtasks).length,
          timestamp: new Date().toISOString(),
        },
      },
    };
  },
};

/**
 * Optimizes task dependencies for better parallelization
 */
export const DependencyOptimizationRule: OptimizationRule = {
  name: 'dependency-optimization',
  description: 'Optimizes task dependencies for better parallelization',
  priority: 9,
  condition: (task) => 
    task.subtasks.some(s => s.dependencies && s.dependencies.length > 0),
  optimize: async (task) => {
    const optimizedSubtasks = task.subtasks.map(subtask => {
      // Only keep essential dependencies
      const essentialDeps = subtask.dependencies.filter(dep => {
        const depTask = task.subtasks.find(t => t.id === dep.taskId);
        if (!depTask) return false;

        // Check if there's actual capability dependency
        const hasCapabilityDependency = depTask.requiredCapabilities.some(cap =>
          subtask.requiredCapabilities.includes(cap)
        );

        return hasCapabilityDependency || dep.type === 'conditional';
      });

      const removedDeps = subtask.dependencies.length - essentialDeps.length;

      return {
        ...subtask,
        dependencies: essentialDeps,
        metadata: {
          ...subtask.metadata,
          dependencyOptimization: {
            originalDependencies: subtask.dependencies.length,
            removedDependencies: removedDeps,
          },
          optimizationHistory: [
            ...(subtask.metadata?.optimizationHistory || []),
            'dependencies-optimized',
          ],
        } as SubtaskMetadata,
      };
    });

    return { 
      ...task, 
      subtasks: optimizedSubtasks,
      metadata: {
        ...task.metadata,
        dependencyOptimization: {
          timestamp: new Date().toISOString(),
        },
      },
    };
  },
};

export function optimizeTaskExecution(tasks: TaskContext[]): TaskContext[] {
  // Sort tasks by priority and dependencies
  return [...tasks].sort((a, b) => {
    // First, sort by priority (higher priority first)
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityMap[a.priority];
    const bPriority = priorityMap[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Then, handle dependencies based on subtasks
    const aHasDeps = Boolean(a.subtasks?.length);
    const bHasDeps = Boolean(b.subtasks?.length);

    if (aHasDeps && !bHasDeps) return 1;
    if (!aHasDeps && bHasDeps) return -1;

    // If both have subtasks, sort by subtask count (fewer first)
    if (aHasDeps && bHasDeps) {
      return (a.subtasks?.length || 0) - (b.subtasks?.length || 0);
    }

    return 0;
  });
}

export function validateTaskDependencies(tasks: TaskContext[]): boolean {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function hasCycle(taskId: string): boolean {
    if (visiting.has(taskId)) return true;
    if (visited.has(taskId)) return false;

    visiting.add(taskId);
    const task = taskMap.get(taskId);
    
    if (task?.subtasks) {
      for (const subtask of task.subtasks) {
        if (subtask.dependencies.some(dep => hasCycle(dep.taskId))) {
          return true;
        }
      }
    }

    visiting.delete(taskId);
    visited.add(taskId);
    return false;
  }

  // Check for cycles in dependencies
  for (const task of tasks) {
    if (!visited.has(task.id) && hasCycle(task.id)) {
      return false;
    }
  }

  return true;
}

export function estimateTaskComplexity(task: TaskContext): number {
  let complexity = 1;

  // Add complexity for subtasks and their dependencies
  if (task.subtasks) {
    complexity += task.subtasks.length * 0.5;
    complexity += task.subtasks.reduce((acc, subtask) => 
      acc + (subtask.dependencies.length * 0.3), 0);
  }

  // Add complexity for priority
  const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
  complexity += priorityMap[task.priority] * 0.2;

  // Add complexity based on description length
  if (task.description) {
    complexity += Math.min(task.description.length / 100, 2);
  }

  return Math.round(complexity * 10) / 10; // Round to 1 decimal place
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
} 