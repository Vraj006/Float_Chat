"""
Model Context Protocol (MCP) Agent for FloatChat application.
Orchestrates agentic AI workflows for complex oceanographic queries.
"""

import json
import asyncio
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

from ..config.settings import config
from ..database.supabase_client import db_client
from ..embeddings.faiss_index import faiss_manager
from ..llm.openrouter_client import llm_client
from ..visualization.plots import plotter


class AgentState(Enum):
    """Agent execution states."""
    IDLE = "idle"
    ANALYZING = "analyzing"
    QUERYING = "querying"
    VISUALIZING = "visualizing"
    SYNTHESIZING = "synthesizing"
    COMPLETED = "completed"
    ERROR = "error"


@dataclass
class AgentTask:
    """Represents a task for the MCP agent."""
    task_id: str
    query: str
    context: Dict[str, Any]
    state: AgentState = AgentState.IDLE
    results: Dict[str, Any] = None
    error_message: str = None

    def __post_init__(self):
        if self.results is None:
            self.results = {}


class MCPAgent:
    """
    Model Context Protocol Agent for orchestrating complex oceanographic queries.
    """

    def __init__(self):
        """Initialize the MCP agent."""
        self.current_task: Optional[AgentTask] = None
        self.task_history: List[AgentTask] = []
        self.tools = {
            "database_query": self._database_query_tool,
            "embedding_search": self._embedding_search_tool,
            "generate_filters": self._generate_filters_tool,
            "create_visualizations": self._visualization_tool,
            "synthesize_answer": self._synthesis_tool
        }

    async def execute_task(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a complete oceanographic analysis task.

        Args:
            query: User's oceanographic query
            context: Additional context for the task

        Returns:
            Complete analysis results
        """
        task_id = f"task_{len(self.task_history) + 1}"
        task = AgentTask(
            task_id=task_id,
            query=query,
            context=context or {}
        )

        self.current_task = task
        self.task_history.append(task)

        try:
            # Step 1: Analyze query and find relevant tables
            task.state = AgentState.ANALYZING
            await self._analyze_query_step(task)

            # Step 2: Query database with generated filters
            task.state = AgentState.QUERYING
            await self._query_database_step(task)

            # Step 3: Generate visualizations
            task.state = AgentState.VISUALIZING
            await self._create_visualizations_step(task)

            # Step 4: Synthesize final answer
            task.state = AgentState.SYNTHESIZING
            await self._synthesize_answer_step(task)

            task.state = AgentState.COMPLETED
            return self._format_final_response(task)

        except Exception as e:
            task.state = AgentState.ERROR
            task.error_message = str(e)
            return {
                "status": "error",
                "error": str(e),
                "task_id": task.task_id
            }

    async def _analyze_query_step(self, task: AgentTask) -> None:
        """Analyze query and identify relevant tables."""
        # Find candidate tables using embeddings
        candidates = faiss_manager.retrieve_table_candidates(
            task.query,
            k=task.context.get("k", 5)
        )

        # Generate database filters using LLM
        filter_response = llm_client.generate_filters(task.query, candidates)

        task.results["candidates"] = candidates
        task.results["filter_response"] = filter_response
        task.results["table_candidates"] = filter_response.get("table_candidates", [])

    async def _query_database_step(self, task: AgentTask) -> None:
        """Query database with generated filters."""
        evidence_data = {}
        table_summaries = []

        for candidate in task.results["table_candidates"]:
            table_name = candidate.get("table")
            filters = candidate.get("filters", [])

            if not table_name:
                continue

            # Query database
            rows = db_client.apply_filters_to_table(table_name, filters, limit=200)
            evidence_data[table_name] = rows

            # Create summary
            if rows:
                columns = list(rows[0].keys()) if rows else []
                summary = {
                    "table": table_name,
                    "row_count": len(rows),
                    "columns": columns,
                    "explanation": candidate.get("explanation", "")
                }
            else:
                summary = {
                    "table": table_name,
                    "row_count": 0,
                    "columns": [],
                    "explanation": candidate.get("explanation", "")
                }

            table_summaries.append(summary)

        task.results["evidence_data"] = evidence_data
        task.results["table_summaries"] = table_summaries

    async def _create_visualizations_step(self, task: AgentTask) -> None:
        """Generate visualizations for the query results."""
        plots = []

        for candidate in task.results["table_candidates"]:
            table_name = candidate.get("table")
            visualizations = candidate.get("visualizations", [])
            rows = task.results["evidence_data"].get(table_name, [])

            if not rows or not visualizations:
                continue

            # Create plots for this table
            table_plots = plotter.create_multiple_plots(
                rows=rows,
                plot_types=visualizations,
                table_name=table_name
            )
            plots.extend(table_plots)

        task.results["plots"] = plots

    async def _synthesize_answer_step(self, task: AgentTask) -> None:
        """Generate final answer using LLM synthesis."""
        evidence_data = task.results.get("evidence_data", {})
        table_summaries = task.results.get("table_summaries", [])

        # Generate comprehensive answer
        final_answer = llm_client.generate_final_answer(
            user_query=task.query,
            evidence_data=evidence_data,
            table_candidates=table_summaries
        )

        task.results["final_answer"] = final_answer

    def _format_final_response(self, task: AgentTask) -> Dict[str, Any]:
        """Format the complete response for the task."""
        return {
            "status": "completed",
            "task_id": task.task_id,
            "query": task.query,
            "answer": task.results.get("final_answer", ""),
            "used_tables": [
                summary["table"] for summary in task.results.get("table_summaries", [])
                if summary.get("row_count", 0) > 0
            ],
            "table_summaries": task.results.get("table_summaries", []),
            "plots": task.results.get("plots", []),
            "candidates": task.results.get("candidates", []),
            "raw_filter_response": task.results.get("filter_response", {}),
            "execution_steps": [
                "Query analysis and table selection",
                "Database querying with generated filters",
                "Visualization generation",
                "Answer synthesis"
            ]
        }

    # Tool implementations for MCP protocol
    async def _database_query_tool(
        self,
        table: str,
        filters: List[Dict[str, Any]],
        limit: int = 200
    ) -> List[Dict[str, Any]]:
        """Tool for querying database with filters."""
        return db_client.apply_filters_to_table(table, filters, limit)

    async def _embedding_search_tool(
        self,
        query: str,
        k: int = 5
    ) -> List[Dict[str, Any]]:
        """Tool for embedding-based table search."""
        return faiss_manager.retrieve_table_candidates(query, k)

    async def _generate_filters_tool(
        self,
        query: str,
        candidates: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Tool for generating database filters."""
        return llm_client.generate_filters(query, candidates)

    async def _visualization_tool(
        self,
        data: List[Dict[str, Any]],
        plot_types: List[str],
        table_name: str = ""
    ) -> List[Dict[str, Any]]:
        """Tool for creating visualizations."""
        return plotter.create_multiple_plots(data, plot_types, table_name)

    async def _synthesis_tool(
        self,
        query: str,
        evidence: Dict[str, List[Dict[str, Any]]],
        summaries: List[Dict[str, Any]]
    ) -> str:
        """Tool for answer synthesis."""
        return llm_client.generate_final_answer(query, evidence, summaries)

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific task."""
        for task in self.task_history:
            if task.task_id == task_id:
                return {
                    "task_id": task.task_id,
                    "state": task.state.value,
                    "query": task.query,
                    "error_message": task.error_message,
                    "completed": task.state == AgentState.COMPLETED
                }
        return None

    def get_current_task_status(self) -> Optional[Dict[str, Any]]:
        """Get status of current task."""
        if self.current_task:
            return self.get_task_status(self.current_task.task_id)
        return None

    def list_available_tools(self) -> List[str]:
        """List available tools for MCP protocol."""
        return list(self.tools.keys())

    async def call_tool(
        self,
        tool_name: str,
        **kwargs
    ) -> Any:
        """Call a specific tool by name."""
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        tool_func = self.tools[tool_name]
        return await tool_func(**kwargs)


class MCPServer:
    """
    Simplified MCP server for handling agent requests.
    """

    def __init__(self):
        """Initialize MCP server."""
        self.agent = MCPAgent()
        self.server_info = {
            "name": config.MCP_SERVER_NAME,
            "version": config.MCP_SERVER_VERSION,
            "protocol_version": "2024-11-05"
        }

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle incoming MCP requests.

        Args:
            request: MCP request dictionary

        Returns:
            MCP response dictionary
        """
        method = request.get("method")
        params = request.get("params", {})

        if method == "initialize":
            return await self._handle_initialize(params)
        elif method == "tools/list":
            return await self._handle_list_tools(params)
        elif method == "tools/call":
            return await self._handle_call_tool(params)
        elif method == "execute_task":
            return await self._handle_execute_task(params)
        else:
            return {
                "error": {
                    "code": -32601,
                    "message": f"Method not found: {method}"
                }
            }

    async def _handle_initialize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle initialization request."""
        return {
            "result": {
                "server_info": self.server_info,
                "capabilities": {
                    "tools": True,
                    "prompts": False,
                    "resources": False
                }
            }
        }

    async def _handle_list_tools(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle list tools request."""
        tools = [
            {
                "name": name,
                "description": f"Tool for {name.replace('_', ' ')}"
            }
            for name in self.agent.list_available_tools()
        ]

        return {"result": {"tools": tools}}

    async def _handle_call_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tool call request."""
        tool_name = params.get("name")
        arguments = params.get("arguments", {})

        try:
            result = await self.agent.call_tool(tool_name, **arguments)
            return {"result": {"content": result}}
        except Exception as e:
            return {
                "error": {
                    "code": -32603,
                    "message": f"Tool execution failed: {str(e)}"
                }
            }

    async def _handle_execute_task(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle complete task execution."""
        query = params.get("query")
        context = params.get("context", {})

        if not query:
            return {
                "error": {
                    "code": -32602,
                    "message": "Query parameter is required"
                }
            }

        try:
            result = await self.agent.execute_task(query, context)
            return {"result": result}
        except Exception as e:
            return {
                "error": {
                    "code": -32603,
                    "message": f"Task execution failed: {str(e)}"
                }
            }


# Global MCP agent and server instances
mcp_agent = MCPAgent()
mcp_server = MCPServer()