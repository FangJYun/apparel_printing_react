"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DataNode } from "antd/es/tree";
import type { RcFile } from "antd/es/upload";
import { Alert, Badge, Button, Card, Checkbox, Empty, Input, Progress, Select, Space, Tag, Tree, Upload } from "antd";
import {
  ChevronDown,
  Database,
  Folder,
  MoreVertical,
  Search,
  UploadCloud
} from "lucide-react";
import { withBasePath } from "../path";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type TreeNodeBase = {
  id: number;
  parentId: number;
  level: number;
  isLeaf: number;
};

type BizTypeTreeNode = TreeNodeBase & {
  typeKey: string;
  typeName: string;
  children: BizTypeTreeNode[];
};

type TagTreeNode = TreeNodeBase & {
  bizTypeId: number;
  tagKey: string;
  tagName: string;
  children: TagTreeNode[];
};

type ImageUploadResult = {
  rawId: number;
  status: number;
  message: string;
};

type ImageTagResult = {
  tagId: number;
  tagKey: string;
  tagName: string;
  confidence: number | null;
};

type ImageRawResult = {
  rawId: number;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  fileExt: string;
  status: number;
  aiResultJson: string | null;
  tags: ImageTagResult[];
};

type ProductCardResult = {
  productId: number;
  rawId: number;
  bizTypeId: number;
  hotScore: number;
  trendScore: number;
  status: number;
  createdAt: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string;
  matchedTag?: ImageTagResult;
  matchedTags?: ImageTagResult[];
  tags?: ImageTagResult[];
};

type ProductPageResult = {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  records: ProductCardResult[];
};

type MaterialTask = {
  id: string;
  fileName: string;
  fileSize: number;
  previewUrl: string;
  rawId?: number;
  status: "uploading" | "processing" | "done" | "failed";
  progress: number;
  message: string;
  result?: ImageRawResult;
  createdAt: string;
};

type LibraryCard = {
  key: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  status: string;
  tags: ImageTagResult[];
  matchedTagIds: Set<number>;
  time: string;
};

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const { Dragger } = Upload;

function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return value || "";
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeStatus(status: number): MaterialTask["status"] {
  if (status === 1) return "done";
  if (status === 2) return "failed";
  return "processing";
}

function progressFromStatus(status: number) {
  if (status === 1 || status === 2) return 100;
  return 66;
}

function taskStatusLabel(status: MaterialTask["status"]) {
  if (status === "uploading") return "上传中";
  if (status === "processing") return "AI 识别中";
  if (status === "done") return "入库中";
  return "识别失败";
}

function parseSummary(aiResultJson?: string | null) {
  if (!aiResultJson) return "";
  try {
    const parsed = JSON.parse(aiResultJson) as { summary?: string; message?: string };
    return parsed.summary || parsed.message || "";
  } catch {
    return "";
  }
}

function flattenBizTypes(nodes: BizTypeTreeNode[]): BizTypeTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenBizTypes(node.children || [])]);
}

function flattenTags(nodes: TagTreeNode[]): TagTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenTags(node.children || [])]);
}

function findPrintBizType(nodes: BizTypeTreeNode[]) {
  return flattenBizTypes(nodes).find((node) => node.typeKey === "print") || flattenBizTypes(nodes)[0];
}

function findFirstLeafTag(nodes: TagTreeNode[]) {
  return flattenTags(nodes).find((node) => node.isLeaf === 1);
}

function bizTreeData(nodes: BizTypeTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: String(node.id),
    title: (
      <span className="antMaterialTreeTitle noCount">
        <span>
          <Folder size={14} />
          {node.typeName}
        </span>
      </span>
    ),
    children: bizTreeData(node.children || [])
  }));
}

function tagTreeData(
  nodes: TagTreeNode[],
  query: string,
  selectedTagIds: Set<number>,
  onToggle: (tag: TagTreeNode) => void
): DataNode[] {
  const normalized = query.trim().toLowerCase();
  return nodes
    .filter((node) => {
      if (!normalized) return true;
      return (
        node.tagName.toLowerCase().includes(normalized) ||
        node.tagKey.toLowerCase().includes(normalized) ||
        flattenTags(node.children || []).some(
          (child) => child.tagName.toLowerCase().includes(normalized) || child.tagKey.toLowerCase().includes(normalized)
        )
      );
    })
    .map((node) => ({
      key: String(node.id),
      title: (
        <span className="antMaterialTreeTitle noCount">
          <span>
            {node.isLeaf === 1 ? (
              <Checkbox
                checked={selectedTagIds.has(node.id)}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(node);
                }}
              />
            ) : (
              <Folder size={14} />
            )}
            {node.tagName}
          </span>
        </span>
      ),
      children: tagTreeData(node.children || [], query, selectedTagIds, onToggle)
    }));
}

export function MaterialUploadPanel() {
  const uploadStartedRef = useRef(false);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [bizTypes, setBizTypes] = useState<BizTypeTreeNode[]>([]);
  const [tags, setTags] = useState<TagTreeNode[]>([]);
  const [selectedBizTypeId, setSelectedBizTypeId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagTreeNode[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tasks, setTasks] = useState<MaterialTask[]>([]);
  const [products, setProducts] = useState<ProductCardResult[]>([]);
  const [productPage, setProductPage] = useState<ProductPageResult | null>(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("加载素材配置中");
  const [error, setError] = useState("");

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.rawId && task.status === "processing").map((task) => task.rawId as number),
    [tasks]
  );

  const selectedTagIds = useMemo(() => new Set(selectedTags.map((tag) => tag.id)), [selectedTags]);
  const selectedTagKeys = selectedTags.map((tag) => String(tag.id));
  const selectedBizTypeName = useMemo(() => {
    const selectedBizType = flattenBizTypes(bizTypes).find((type) => type.id === selectedBizTypeId);
    return selectedBizType?.typeName || "素材";
  }, [bizTypes, selectedBizTypeId]);

  const libraryCards = useMemo<LibraryCard[]>(() => {
    const taskCards: LibraryCard[] = tasks.map((task) => ({
      key: task.id,
      title: task.fileName,
      subtitle: parseSummary(task.result?.aiResultJson) || `本地上传 · ${formatSize(task.result?.fileSize || task.fileSize)}`,
      imageUrl: task.result?.thumbnailUrl || task.previewUrl,
      status: task.status === "done" ? "已入库" : taskStatusLabel(task.status),
      tags: task.result?.tags || [],
      matchedTagIds: new Set(),
      time: formatTime(task.createdAt)
    }));
    const productCards: LibraryCard[] = products.map((product) => {
      const matchedTags = product.matchedTags?.length ? product.matchedTags : product.matchedTag ? [product.matchedTag] : [];
      const allTags = product.tags?.length ? product.tags : matchedTags;
      return {
        key: `product-${product.productId}`,
        title: product.fileName || `素材 #${product.rawId}`,
        subtitle: `${selectedBizTypeName}标签：`,
        imageUrl: product.thumbnailUrl || product.fileUrl,
        status: product.status === 1 ? "已入库" : "待复核",
        tags: allTags,
        matchedTagIds: new Set(matchedTags.map((tag) => tag.tagId)),
        time: formatTime(product.createdAt)
      };
    });

    return [...taskCards, ...productCards].filter((card) => {
      const keyword = libraryQuery.trim().toLowerCase();
      const matchKeyword =
        !keyword ||
        card.title.toLowerCase().includes(keyword) ||
        card.subtitle.toLowerCase().includes(keyword) ||
        card.tags.some((tag) => tag.tagName.toLowerCase().includes(keyword) || tag.tagKey.toLowerCase().includes(keyword));
      const matchStatus = statusFilter === "all" || card.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [libraryQuery, products, selectedBizTypeName, statusFilter, tasks]);

  function toggleSelectedTag(tag: TagTreeNode) {
    if (tag.isLeaf !== 1) return;
    setSelectedTags((current) =>
      current.some((item) => item.id === tag.id)
        ? current.filter((item) => item.id !== tag.id)
        : [...current, tag]
    );
  }

  function removeSelectedTag(tagId: number) {
    setSelectedTags((current) => current.filter((tag) => tag.id !== tagId));
  }

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    async function loadBizTypes() {
      setLoadingMessage("加载业务类型中");
      try {
        const response = await fetch(withBasePath("/api/materials/biz-types"), { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<BizTypeTreeNode[]>;
        if (disposed) return;
        if (payload.code !== 200 || !Array.isArray(payload.data)) {
          throw new Error(payload.message || "业务类型加载失败");
        }
        setBizTypes(payload.data);
        const printType = findPrintBizType(payload.data);
        setSelectedBizTypeId(printType?.id || null);
      } catch (loadError) {
        if (!disposed) setError(loadError instanceof Error ? loadError.message : "业务类型加载失败");
      } finally {
        if (!disposed) setLoadingMessage("");
      }
    }

    void loadBizTypes();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedBizTypeId) return;
    let disposed = false;

    async function loadTags() {
      setLoadingMessage("加载标签树中");
      setTags([]);
      setSelectedTags([]);
      try {
        const response = await fetch(withBasePath(`/api/materials/tags?bizTypeId=${selectedBizTypeId}`), {
          cache: "no-store"
        });
        const payload = (await response.json()) as ApiResponse<TagTreeNode[]>;
        if (disposed) return;
        if (payload.code !== 200 || !Array.isArray(payload.data)) {
          throw new Error(payload.message || "标签加载失败");
        }
        setTags(payload.data);
        const firstLeafTag = findFirstLeafTag(payload.data);
        setSelectedTags(firstLeafTag ? [firstLeafTag] : []);
      } catch (loadError) {
        if (!disposed) setError(loadError instanceof Error ? loadError.message : "标签加载失败");
      } finally {
        if (!disposed) setLoadingMessage("");
      }
    }

    void loadTags();
    return () => {
      disposed = true;
    };
  }, [selectedBizTypeId]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setProducts([]);
      setProductPage(null);
      return;
    }
    const tagIds = selectedTags.map((tag) => tag.id);
    let disposed = false;

    async function loadProducts() {
      try {
        const response = await fetch(withBasePath("/api/materials/products"), {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ tagIds, page: 1, pageSize: 20 }),
          cache: "no-store"
        });
        const payload = (await response.json()) as ApiResponse<ProductPageResult>;
        if (disposed) return;
        if (payload.code !== 200 || !payload.data) {
          throw new Error(payload.message || "素材列表加载失败");
        }
        setProductPage(payload.data);
        setProducts(payload.data.records || []);
      } catch (loadError) {
        if (!disposed) {
          setProducts([]);
          setProductPage(null);
          setError(loadError instanceof Error ? loadError.message : "素材列表加载失败");
        }
      }
    }

    void loadProducts();
    return () => {
      disposed = true;
    };
  }, [selectedTags]);

  useEffect(() => {
    if (activeTasks.length === 0) return;
    let disposed = false;

    async function tick() {
      try {
        const response = await fetch(withBasePath(`/api/materials/list?rawIds=${activeTasks.join(",")}`), {
          cache: "no-store"
        });
        const payload = (await response.json()) as ApiResponse<ImageRawResult[]>;
        if (!disposed && payload.code === 200 && Array.isArray(payload.data)) {
          mergeRawResults(payload.data);
        }
      } catch {
        if (!disposed) setError("轮询识别状态失败，请稍后手动刷新");
      }
    }

    const timer = window.setInterval(tick, 2500);
    void tick();

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [activeTasks]);

  function mergeRawResults(results: ImageRawResult[]) {
    setTasks((current) =>
      current.map((task) => {
        const result = results.find((entry) => entry.rawId === task.rawId);
        if (!result) return task;
        const nextStatus = normalizeStatus(result.status);
        return {
          ...task,
          fileName: result.fileName || task.fileName,
          status: nextStatus,
          progress: progressFromStatus(result.status),
          message:
            nextStatus === "done"
              ? "AI 标签识别完成"
              : nextStatus === "failed"
                ? parseSummary(result.aiResultJson) || "AI 识别失败"
                : "AI 正在分析图片标签",
          result
        };
      })
    );
  }

  async function handleFiles(files: File[]) {
    setError("");
    const images = files.filter((file) => acceptedTypes.has(file.type));
    if (images.length === 0) {
      setError("仅支持 jpg、png、webp 图片");
      return;
    }
    if (images.length > 10) {
      setError("后端一次最多处理 10 张图片，请分批上传");
      return;
    }

    const localTasks = images.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        fileName: file.name,
        fileSize: file.size,
        previewUrl,
        status: "uploading" as const,
        progress: 18,
        message: "正在上传到素材库",
        createdAt: new Date().toISOString()
      };
    });

    setTasks((current) => [...localTasks, ...current]);
    setIsUploading(true);

    try {
      const formData = new FormData();
      images.forEach((file) => formData.append("files", file));
      const response = await fetch(withBasePath("/api/materials/upload"), {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as ApiResponse<ImageUploadResult[]>;
      if (payload.code !== 200 || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "上传失败");
      }

      const resultById = new Map(localTasks.map((task, index) => [task.id, payload.data[index]] as const));
      setTasks((current) =>
        current.map((task) => {
          const result = resultById.get(task.id);
          if (result === undefined) return task;
          const nextStatus = normalizeStatus(result.status);
          return {
            ...task,
            rawId: result.rawId,
            status: nextStatus,
            progress: nextStatus === "processing" ? 48 : progressFromStatus(result.status),
            message: result.message || "上传成功，等待 AI 分析"
          };
        })
      );

      const rawIds = payload.data.map((item) => item.rawId).filter(Boolean);
      if (rawIds.length > 0) await refreshRawResults(rawIds);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "上传失败";
      setError(message);
      setTasks((current) =>
        current.map((task) =>
          localTasks.some((localTask) => localTask.id === task.id)
            ? { ...task, status: "failed", progress: 100, message }
            : task
        )
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function refreshRawResults(rawIds: number[]) {
    const response = await fetch(withBasePath(`/api/materials/list?rawIds=${rawIds.join(",")}`), {
      cache: "no-store"
    });
    const payload = (await response.json()) as ApiResponse<ImageRawResult[]>;
    if (payload.code === 200 && Array.isArray(payload.data)) mergeRawResults(payload.data);
  }

  function onUploadBatch(files: RcFile[]) {
    if (uploadStartedRef.current) return;
    uploadStartedRef.current = true;
    window.setTimeout(() => {
      uploadStartedRef.current = false;
    }, 0);
    void handleFiles(files);
  }

  return (
    <section className="antMaterialStudio">
      <header className="antMaterialHeader">
        <h1>素材库</h1>
        <p>图片上传、AI识别、标签筛选与素材管理</p>
      </header>

      {error ? <Alert message={error} type="warning" closable onClose={() => setError("")} /> : null}

      <div className="antMaterialLayout">
        <Card title="类型分类" extra={<Database size={14} />} className="antMaterialSideCard">
          {loadingMessage && bizTypes.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={loadingMessage} /> : null}
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={selectedBizTypeId ? [String(selectedBizTypeId)] : []}
            treeData={bizTreeData(bizTypes)}
            onSelect={(keys) => setSelectedBizTypeId(Number(keys[0]))}
          />
        </Card>

        <Card title="标签筛选（印花）" className="antMaterialFilterCard">
          <Input
            allowClear
            prefix={<Search size={15} />}
            placeholder="搜索标签"
            value={tagQuery}
            onChange={(event) => setTagQuery(event.target.value)}
          />
          <div className="selectedAntTags">
            <span>已选标签：</span>
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Tag closable key={tag.id} onClose={() => removeSelectedTag(tag.id)}>
                  {tag.tagName}
                </Tag>
              ))
            ) : (
              <Tag>请选择叶子标签</Tag>
            )}
            {selectedTags.length > 0 ? (
              <Button type="link" size="small" onClick={() => setSelectedTags([])}>
                清空
              </Button>
            ) : null}
          </div>
          {loadingMessage && tags.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={loadingMessage} /> : null}
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={selectedTagKeys}
            treeData={tagTreeData(tags, tagQuery, selectedTagIds, toggleSelectedTag)}
            onSelect={(_, info) => {
              const id = Number(info.node.key);
              const tag = flattenTags(tags).find((item) => item.id === id);
              if (tag?.isLeaf === 1) toggleSelectedTag(tag);
            }}
          />
        </Card>

        <Card
          className="antMaterialLibraryCard"
          title={
            <Space size={10}>
              <span>素材库</span>
              <span className="libraryCount">共 {productPage?.total ?? libraryCards.length} 条</span>
            </Space>
          }
        >
          <div className="antMaterialToolbar">
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索文件名、标签、描述"
              value={libraryQuery}
              onChange={(event) => setLibraryQuery(event.target.value)}
            />
            <Select
              value={statusFilter}
              suffixIcon={<ChevronDown size={14} />}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "全部状态" },
                { value: "已入库", label: "已入库" },
                { value: "AI 识别中", label: "AI 识别中" },
                { value: "上传中", label: "上传中" },
                { value: "识别失败", label: "识别失败" }
              ]}
            />
          </div>

          <Dragger
            multiple
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
            beforeUpload={(file, fileList) => {
              if (file.uid === fileList[0]?.uid) onUploadBatch(fileList as RcFile[]);
              return Upload.LIST_IGNORE;
            }}
            disabled={isUploading}
            className="antMaterialDragger"
          >
            <p className="ant-upload-drag-icon">
              <UploadCloud size={38} />
            </p>
            <p className="ant-upload-text">拖拽图片到这里，或点击上传</p>
            <p className="ant-upload-hint">支持 jpg、png、webp；单次最多 10 张，单张最大 60MB</p>
          </Dragger>

          <section className="antRecentTasks">
            <div className="recentTitle">最近任务</div>
            {tasks.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="上传图片后会显示异步识别进度" />
            ) : (
              tasks.slice(0, 4).map((task) => (
                <div className="antTaskRow" key={task.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={task.result?.thumbnailUrl || task.previewUrl} alt={task.fileName} />
                  <strong>{task.fileName}</strong>
                  <Badge status={task.status === "failed" ? "error" : task.status === "done" ? "success" : "processing"} text={taskStatusLabel(task.status)} />
                  <Progress percent={task.progress} showInfo={false} strokeColor={task.status === "done" ? "#009a82" : "#1677ff"} />
                  <time>{formatTime(task.createdAt)}</time>
                  <Button type="link" size="small">
                    查看详情
                  </Button>
                </div>
              ))
            )}
          </section>

          <section className="antLibraryGrid">
            {libraryCards.length === 0 ? (
              <Empty description={selectedTags.length > 0 ? "当前标签暂无素材" : "请选择标签或上传素材"} />
            ) : (
              libraryCards.map((card) => (
                <Card
                  hoverable
                  size="small"
                  key={card.key}
                  className="antLibraryItem"
                  cover={
                    <div className="antLibraryCover">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.imageUrl} alt={card.title} />
                      <Checkbox className="coverCheck" />
                      <Button className="coverMore" icon={<MoreVertical size={14} />} />
                    </div>
                  }
                >
                  <div className="libraryItemTitle">
                    <strong>{card.title}</strong>
                    <Tag color={card.status === "已入库" ? "green" : card.status === "识别失败" ? "orange" : "blue"}>{card.status}</Tag>
                  </div>
                  <p>{card.subtitle}</p>
                  <Space className="libraryTagList" size={[4, 4]} wrap>
                    {card.tags.length > 0 ? (
                      card.tags.slice(0, 6).map((tag) => (
                        <Tag className={card.matchedTagIds.has(tag.tagId) ? "matchedLibraryTag" : undefined} key={tag.tagId}>
                          {tag.tagName}
                        </Tag>
                      ))
                    ) : (
                      <Tag>待识别</Tag>
                    )}
                  </Space>
                  <footer>
                    <time>{card.time}</time>
                  </footer>
                </Card>
              ))
            )}
          </section>
        </Card>
      </div>
    </section>
  );
}
