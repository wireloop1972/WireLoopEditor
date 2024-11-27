import type { WebSocket as WS } from 'ws';
import { EventEmitter } from 'events';

interface MCPMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface MCPConnection {
  id: string;
  socket: WS;
  context: Map<string, unknown>;
}

export class MCPServer extends EventEmitter {
  private connections: Map<string, MCPConnection>;
  private wss: any;

  constructor(wss: any) {
    super();
    this.wss = wss;
    this.connections = new Map();
  }

  public async start(): Promise<void> {
    this.wss.on('connection', this.handleConnection.bind(this));
    this.emit('started');
  }

  public async stop(): Promise<void> {
    // Close all connections
    for (const connection of this.connections.values()) {
      connection.socket.close();
    }
    this.connections.clear();
    this.emit('stopped');
  }

  public getConnections(): Array<{ id: string; context: Record<string, unknown> }> {
    return Array.from(this.connections.values()).map(conn => ({
      id: conn.id,
      context: Object.fromEntries(conn.context),
    }));
  }

  private handleConnection(socket: WS): void {
    const connectionId = Math.random().toString(36).substring(2, 15);
    
    const connection: MCPConnection = {
      id: connectionId,
      socket,
      context: new Map(),
    };

    this.connections.set(connectionId, connection);
    this.emit('connection', connectionId);

    socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data) as MCPMessage;
        this.handleMessage(connection, message);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Invalid message format',
          },
        }));
      }
    });

    socket.on('close', () => {
      this.connections.delete(connectionId);
      this.emit('disconnection', connectionId);
    });

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'welcome',
      payload: {
        connectionId,
        timestamp: Date.now(),
      },
    }));
  }

  private handleMessage(connection: MCPConnection, message: MCPMessage): void {
    switch (message.type) {
      case 'context.update':
        this.handleContextUpdate(connection, message.payload);
        break;

      case 'context.get':
        this.handleContextGet(connection, message.payload);
        break;

      case 'broadcast':
        this.handleBroadcast(connection, message.payload);
        break;

      default:
        connection.socket.send(JSON.stringify({
          type: 'error',
          payload: {
            message: `Unknown message type: ${message.type}`,
          },
        }));
    }
  }

  private handleContextUpdate(
    connection: MCPConnection,
    payload: Record<string, unknown>
  ): void {
    const { key, value } = payload as { key: string; value: unknown };
    connection.context.set(key, value);

    connection.socket.send(JSON.stringify({
      type: 'context.updated',
      payload: {
        key,
        timestamp: Date.now(),
      },
    }));

    this.emit('contextUpdate', {
      connectionId: connection.id,
      key,
      value,
    });
  }

  private handleContextGet(
    connection: MCPConnection,
    payload: Record<string, unknown>
  ): void {
    const { key } = payload as { key: string };
    const value = connection.context.get(key);

    connection.socket.send(JSON.stringify({
      type: 'context.value',
      payload: {
        key,
        value,
        timestamp: Date.now(),
      },
    }));
  }

  private handleBroadcast(
    connection: MCPConnection,
    payload: Record<string, unknown>
  ): void {
    const { message } = payload as { message: unknown };

    // Send to all connections except sender
    for (const [id, conn] of this.connections) {
      if (id !== connection.id) {
        conn.socket.send(JSON.stringify({
          type: 'broadcast',
          payload: {
            from: connection.id,
            message,
            timestamp: Date.now(),
          },
        }));
      }
    }

    this.emit('broadcast', {
      from: connection.id,
      message,
    });
  }
} 