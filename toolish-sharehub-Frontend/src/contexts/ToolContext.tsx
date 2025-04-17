import React, {
    createContext,
    useContext,
    useState,
    useCallback,
} from "react";

interface Owner {
    _id: string;
    name: string;
    rating: number;
    responseTime: string;
}

interface Tool {
    _id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    image: string;
    category: string;
    location: string;
    owner?: Owner;
    createdAt: Date;
    website?: string;
    specifications?: { [key: string]: string };
    rules: string[];
}

interface ToolContextType {
    tool: Tool | null;
    isFetchingTool: boolean;
    fetchError: string | null;
    fetchTool: (toolId: string) => Promise<void>;
    deleteTool: (toolId: string) => Promise<void>;
    updateTool: (tool: Tool) => void;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tool, setTool] = useState<Tool | null>(null);
    const [isFetchingTool, setIsFetchingTool] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchTool = useCallback(async (toolId: string) => {
        setIsFetchingTool(true);
        setFetchError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tools/${toolId}`);

            if (!response.ok) {
                // Handle non-200 responses
                setTool(null);
                setFetchError(`Tool not found: HTTP ${response.status}`);
            } else {
                const data = await response.json();
                setTool(data);
            }
        } catch (e: any) {
            // Handle network errors
            setTool(null);
            setFetchError(`Network error: ${e.message}`);
        } finally {
            setIsFetchingTool(false);
        }
    }, []);

    const deleteTool = useCallback(async (toolId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tools/${toolId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Could not delete tool, status: ${response.status}`);
            }
            setTool(null);  // Reset tool state after deletion
        } catch (e: any) {
            setFetchError(e.message);  // Handle deletion error
        }
    }, []);

    const updateTool = useCallback((updatedTool: Tool) => {
        setTool(updatedTool);
    }, []);

    const value: ToolContextType = {
        tool,
        isFetchingTool,
        fetchError,
        fetchTool,
        deleteTool,
        updateTool,
    };

    return (
        <ToolContext.Provider value={value}>{children}</ToolContext.Provider>
    );
};

export const useTool = () => {
    const context = useContext(ToolContext);
    if (context === undefined) {
        throw new Error("useTool must be used within a ToolProvider");
    }
    return context;
};

export type { Tool, ToolContextType };
