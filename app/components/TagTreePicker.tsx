"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Empty, Input, Popover, Tag } from "antd";
import { ChevronDown, ChevronRight, Search, Tags } from "lucide-react";

export type TagTreePickerNode = {
  id: number;
  tagKey?: string;
  tagName: string;
  isLeaf?: number;
  children?: TagTreePickerNode[];
};

type TagTreePickerProps = {
  nodes: TagTreePickerNode[];
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
};

function flattenNodes(nodes: TagTreePickerNode[]): TagTreePickerNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children || [])]);
}

function leafIds(node: TagTreePickerNode): number[] {
  const children = node.children || [];
  if (!children.length || node.isLeaf === 1) return [node.id];
  return children.flatMap(leafIds);
}

function folderIds(nodes: TagTreePickerNode[]): number[] {
  return nodes.flatMap((node) => {
    const children = node.children || [];
    return children.length ? [node.id, ...folderIds(children)] : [];
  });
}

function filterTagTree(nodes: TagTreePickerNode[], keyword: string): TagTreePickerNode[] {
  const term = keyword.trim().toLowerCase();
  if (!term) return nodes;

  return nodes.reduce<TagTreePickerNode[]>((result, node) => {
    const children = filterTagTree(node.children || [], keyword);
    const matched = node.tagName.toLowerCase().includes(term) || (node.tagKey || "").toLowerCase().includes(term);
    if (!matched && !children.length) return result;
    result.push({
      ...node,
      children: matched ? node.children || [] : children
    });
    return result;
  }, []);
}

export function TagTreePicker({ nodes, value, onChange, disabled }: TagTreePickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [draftValue, setDraftValue] = useState<number[]>(value);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const allNodes = useMemo(() => flattenNodes(nodes), [nodes]);
  const leafIdSet = useMemo(() => new Set(allNodes.filter((node) => !node.children?.length || node.isLeaf === 1).map((node) => node.id)), [allNodes]);
  const selectedLeafNodes = useMemo(
    () =>
      draftValue
        .filter((id) => leafIdSet.has(id))
        .map((id) => allNodes.find((node) => node.id === id))
        .filter((node): node is TagTreePickerNode => Boolean(node)),
    [allNodes, draftValue, leafIdSet]
  );
  const selectedLeafCount = useMemo(() => value.filter((id) => leafIdSet.has(id)).length, [leafIdSet, value]);
  const visibleNodes = useMemo(() => filterTagTree(nodes, keyword), [keyword, nodes]);
  const searchMode = Boolean(keyword.trim());
  const expandedSet = useMemo(
    () => new Set(searchMode ? folderIds(visibleNodes) : expandedIds),
    [expandedIds, searchMode, visibleNodes]
  );
  const selectedSet = useMemo(() => new Set(draftValue), [draftValue]);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    setExpandedIds([]);
  }, [nodes]);

  function commitDraft() {
    onChange(draftValue.filter((id) => leafIdSet.has(id)));
    setOpen(false);
  }

  function toggleExpanded(id: number) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleNode(node: TagTreePickerNode) {
    if (node.children?.length && node.isLeaf !== 1) return;
    const targetLeafIds = leafIds(node).filter((id) => leafIdSet.has(id));
    if (!targetLeafIds.length) return;

    setDraftValue((current) => {
      const currentSet = new Set(current);
      const allSelected = targetLeafIds.every((id) => currentSet.has(id));
      targetLeafIds.forEach((id) => {
        if (allSelected) {
          currentSet.delete(id);
        } else {
          currentSet.add(id);
        }
      });
      return Array.from(currentSet);
    });
  }

  function removeTag(id: number) {
    setDraftValue((current) => current.filter((item) => item !== id));
  }

  function renderNodes(items: TagTreePickerNode[], depth = 0) {
    return items.map((node) => {
      const children = node.children || [];
      const hasChildren = children.length > 0;
      const expanded = expandedSet.has(node.id);
      const isSelectableLeaf = !hasChildren || node.isLeaf === 1;
      const nodeLeafIds = leafIds(node).filter((id) => leafIdSet.has(id));
      const checkedCount = nodeLeafIds.filter((id) => selectedSet.has(id)).length;
      const checked = nodeLeafIds.length > 0 && checkedCount === nodeLeafIds.length;
      const indeterminate = checkedCount > 0 && checkedCount < nodeLeafIds.length;

      return (
        <div className="tagTreePickerNode" key={node.id}>
          <div
            className={`tagTreePickerRow ${checked ? "checked" : ""} ${hasChildren ? "folder" : "leaf"}`}
            style={{ paddingLeft: 10 + depth * 32 }}
          >
            {hasChildren ? (
              <button
                aria-label={expanded ? "收起标签分组" : "展开标签分组"}
                className="tagTreePickerExpand"
                type="button"
                onClick={() => toggleExpanded(node.id)}
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="tagTreePickerExpand" />
            )}
            {isSelectableLeaf ? (
              <Checkbox checked={checked} onChange={() => toggleNode(node)} />
            ) : (
              <span className="tagTreePickerReadonlyCheck">
                <Checkbox checked={checked} indeterminate={indeterminate} />
              </span>
            )}
            <button
              className="tagTreePickerName"
              type="button"
              onClick={() => {
                if (hasChildren) {
                  toggleExpanded(node.id);
                } else {
                  toggleNode(node);
                }
              }}
            >
              {node.tagName}
            </button>
          </div>
          {hasChildren && expanded ? renderNodes(children, depth + 1) : null}
        </div>
      );
    });
  }

  const content = (
    <div className="tagTreePickerPanel">
      <Input
        className="tagTreePickerSearch"
        prefix={<Search size={18} />}
        value={keyword}
        placeholder="搜索标签、拼音、英文 key"
        onChange={(event) => setKeyword(event.target.value)}
      />
      <div className="tagTreePickerSelected">
        {selectedLeafNodes.length ? (
          selectedLeafNodes.map((node) => (
            <Tag key={node.id} closable onClose={() => removeTag(node.id)}>
              {node.tagName}
            </Tag>
          ))
        ) : (
          <span>请选择叶子标签</span>
        )}
      </div>
      <div className="tagTreePickerTree">
        {visibleNodes.length ? renderNodes(visibleNodes) : <Empty description="暂无匹配标签" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </div>
      <footer className="tagTreePickerFooter">
        <Button onClick={() => setDraftValue([])}>清空</Button>
        <Button type="primary" onClick={commitDraft}>
          确定
        </Button>
      </footer>
    </div>
  );

  return (
    <Popover
      arrow={false}
      content={content}
      open={open}
      overlayClassName="tagTreePickerPopover"
      placement="bottomLeft"
      trigger="click"
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
        if (nextOpen) {
          setDraftValue(value);
          setKeyword("");
        }
      }}
    >
      <button className={open ? "tagTreePickerTrigger open" : "tagTreePickerTrigger"} disabled={disabled} type="button">
        <Tags size={18} />
        <span>{selectedLeafCount ? `已选 ${selectedLeafCount} 个标签` : "请选择叶子标签"}</span>
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
    </Popover>
  );
}
