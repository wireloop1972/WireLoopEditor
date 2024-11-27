import { NextResponse } from 'next/server';
import type { WebSocketServer } from 'ws';
import { MCPServer } from '@/lib/mcp/server';

let mcpServer: MCPServer | null = null;
let wss: WebSocketServer | null = null;

// We'll use dynamic import for the WebSocket server to avoid build issues
async function getWebSocketServer() {
  const ws = await import('ws');
  return new ws.WebSocketServer({ port: 3001 });
}

export async function POST() {
  try {
    if (mcpServer) {
      return NextResponse.json(
        { error: 'MCP server is already running' },
        { status: 400 }
      );
    }

    // Create WebSocket server
    wss = await getWebSocketServer();

    // Initialize MCP server
    mcpServer = new MCPServer(wss);
    await mcpServer.start();

    return NextResponse.json({ status: 'running' });
  } catch (error) {
    console.error('Error starting MCP server:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start MCP server' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (!mcpServer) {
      return NextResponse.json(
        { error: 'MCP server is not running' },
        { status: 400 }
      );
    }

    // Stop MCP server
    await mcpServer.stop();
    mcpServer = null;

    // Close WebSocket server
    wss?.close();
    wss = null;

    return NextResponse.json({ status: 'stopped' });
  } catch (error) {
    console.error('Error stopping MCP server:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stop MCP server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: mcpServer ? 'running' : 'stopped',
    connections: mcpServer?.getConnections() || [],
  });
} 