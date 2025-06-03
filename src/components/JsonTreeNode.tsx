 "use client";

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JsonTreeNodeProps {
  nodeKey?: string;
  value: any;
  path: string;
  level: number;
  searchTerm: string;
  expandedPaths: Set<string>;
  toggleNode: (path: string) => void;
}

const highlightSearch = (text: string, term: string): React.ReactNode => {
  if (!term || term.trim() === '') {
    return text;
  }
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="search-highlight">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const getValueClassName = (value: any): string => {
  if (typeof value === 'string') return 'json-string';
  if (typeof value === 'number') return 'json-number';
  if (typeof value === 'boolean') return 'json-boolean';
  if (value === null) return 'json-null';
  return '';
};

export function JsonTreeNode({
  nodeKey,
  value,
  path,
  level,
  searchTerm,
  expandedPaths,
  toggleNode,
}: JsonTreeNodeProps) {
  const isCurrentlyExpanded = expandedPaths.has(path);

  const renderNodeKey = () => {
    if (nodeKey === undefined) return null; // Root node might not have a key display
    // For array items, nodeKey is index, don't treat as typical JSON key
    const isArrayIndex = /^\d+$/.test(nodeKey) && path.includes('['); 
    const keyClass = isArrayIndex ? "" : "json-key";
    const keyDisplay = isArrayIndex ? "" : `"${nodeKey}": `;

    return (
      <span className={keyClass}>
        {highlightSearch(keyDisplay, searchTerm)}
      </span>
    );
  };

  if (typeof value === 'object' && value !== null) {
    const isArray = Array.isArray(value);
    const entries = Object.entries(value);
    const isEmpty = entries.length === 0;

    const Icon = isCurrentlyExpanded ? ChevronDown : ChevronRight;
    const punctuation = isArray ? ['[', ']'] : ['{', '}'];

    return (
      <div className="py-0.5">
        <div className="flex items-start">
          {!isEmpty && (
            <button
              onClick={() => toggleNode(path)}
              className="mr-1 p-0.5 rounded hover:bg-muted focus:outline-none focus:ring-1 focus:ring-accent"
              aria-expanded={isCurrentlyExpanded}
              aria-controls={`json-node-children-${path}`}
              title={isCurrentlyExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon size={16} className="text-muted-foreground" />
            </button>
          )}
          {isEmpty && <div className="w-[22px] mr-1"></div>} {/* Placeholder for icon spacing */}
          
          <span className="flex-shrink-0">
            {renderNodeKey()}
            <span className="json-punctuation">{punctuation[0]}</span>
          </span>
          {!isCurrentlyExpanded && !isEmpty && (
             <span className="json-punctuation text-muted-foreground ml-1">...</span>
          )}
           {!isCurrentlyExpanded && !isEmpty && (
            <span className="json-punctuation ml-0">{punctuation[1]}</span>
          )}
           {!isCurrentlyExpanded && !isEmpty && (
            <span className="text-muted-foreground ml-1 text-xs">({entries.length} item{entries.length !== 1 ? 's' : ''})</span>
          )}
        </div>

        {isCurrentlyExpanded && !isEmpty && (
          <div id={`json-node-children-${path}`} className="ml-6 pl-2 border-l border-muted-foreground/30">
            {entries.map(([key, val], index) => {
              const childPath = isArray ? `${path}[${index}]` : `${path}.${key}`;
              return (
                <JsonTreeNode
                  key={childPath}
                  nodeKey={key}
                  value={val}
                  path={childPath}
                  level={level + 1}
                  searchTerm={searchTerm}
                  expandedPaths={expandedPaths}
                  toggleNode={toggleNode}
                />
              );
            })}
          </div>
        )}
        {isCurrentlyExpanded && (
            <div className="flex items-start" style={{ paddingLeft: isEmpty ? '22px' : '0px'}}> {/* Align closing bracket */}
                 <span className="json-punctuation" style={{ paddingLeft: isEmpty ? '0px' : '22px'}}>{punctuation[1]}</span>
            </div>
        )}
      </div>
    );
  }

  // Primitive value
  return (
    <div className="py-0.5 flex items-start" style={{ paddingLeft: '22px'}}> {/* Indent primitives like expanded children */}
      {renderNodeKey()}
      <span className={getValueClassName(value)}>
        {highlightSearch(typeof value === 'string' ? `"${value}"` : String(value), searchTerm)}
      </span>
    </div>
  );
}
