 "use client";

import React from 'react';
import { JsonTreeNode } from './JsonTreeNode';

interface JsonTreeViewProps {
  data: any;
  searchTerm: string;
  expandedPaths: Set<string>;
  toggleNode: (path: string) => void;
}

export function JsonTreeView({ data, searchTerm, expandedPaths, toggleNode }: JsonTreeViewProps) {
  if (data === null || data === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Formatted JSON will appear here
      </div>
    );
  }

  return (
    <div className="font-code text-sm leading-relaxed">
      <JsonTreeNode
        value={data}
        path="root" // Base path for the root of the JSON
        level={0}
        searchTerm={searchTerm}
        expandedPaths={expandedPaths}
        toggleNode={toggleNode}
      />
    </div>
  );
}
