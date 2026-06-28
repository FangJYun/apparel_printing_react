"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DataNode } from "antd/es/tree";
import type { RcFile } from "antd/es/upload";
import { Alert, Badge, Button, Card, Checkbox, Drawer, Empty, Input, Modal, Progress, Space, Tag, Tooltip, Tree, Upload, message } from "antd";
import {
  Copy,
  Database,
  Download,
  Folder,
  Maximize2,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  UploadCloud,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { withBasePath } from "../path";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const TASK_STATUS_POLL_INTERVAL_MS = 2500;
const IMAGE2_REFERENCE_STORAGE_KEY = "apparel-printing:image2-reference-product";

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

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

type ImageReRecognizeResult = {
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
  createdAt?: string;
  tags: ImageTagResult[];
};

type ProductCardResult = {
  productId: number;
  rawId: number;
  bizTypeId: number;
  aiStatus?: number;
  hotScore: number;
  trendScore: number;
  status: number;
  createdAt: string;
  fileName: string;
  fileSize?: number;
  fileObjectKey?: string;
  thumbnailObjectKey?: string;
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
  status: "uploading" | "processing" | "done" | "failed" | "upload_failed";
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
  product: ProductCardResult;
};

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const { Dragger } = Upload;

function formatSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "--";
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function filenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) return "";

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return encodedMatch[1];
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || "";
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

function fileExtFromName(fileName?: string) {
  if (!fileName || !fileName.includes(".")) return "--";
  return fileName.split(".").pop()?.toUpperCase() || "--";
}

function confidencePercent(confidence: number | null) {
  if (!Number.isFinite(confidence || NaN)) return 0;
  const normalized = confidence && confidence <= 1 ? confidence * 100 : confidence || 0;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function confidenceColor(percent: number) {
  if (percent >= 88) return "#009a82";
  if (percent >= 80) return "#13a779";
  return "#f59f00";
}

function progressFromStatus(status: number) {
  if (status === 1 || status === 2) return 100;
  return 66;
}

function taskStatusLabel(status: MaterialTask["status"]) {
  if (status === "uploading") return "上传中";
  if (status === "processing") return "AI 识别中";
  if (status === "done") return "已入库";
  if (status === "upload_failed") return "上传失败";
  return "识别失败";
}

function productAiStatusLabel(aiStatus?: number) {
  if (aiStatus === 1) return "已入库";
  if (aiStatus === 2) return "识别失败";
  return "待处理";
}

function productAiStatusTagColor(aiStatus?: number) {
  if (aiStatus === 1) return "green";
  if (aiStatus === 2) return "orange";
  return "blue";
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

function taskMessageFromRaw(result: ImageRawResult, status: MaterialTask["status"]) {
  if (status === "done") return "AI 标签识别完成";
  if (status === "failed") return parseSummary(result.aiResultJson) || "AI 识别失败";
  return "AI 正在分析图片标签";
}

function taskFromRawResult(result: ImageRawResult, existingTask?: MaterialTask): MaterialTask {
  const status = normalizeStatus(result.status);
  return {
    id: existingTask?.id || `raw-${result.rawId}`,
    fileName: result.fileName || existingTask?.fileName || `素材 #${result.rawId}`,
    fileSize: result.fileSize || existingTask?.fileSize || 0,
    previewUrl: result.thumbnailUrl || result.fileUrl || existingTask?.previewUrl || "",
    rawId: result.rawId,
    status,
    progress: progressFromStatus(result.status),
    message: taskMessageFromRaw(result, status),
    result,
    createdAt: result.createdAt || existingTask?.createdAt || new Date().toISOString()
  };
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
  onToggle: (tag: TagTreeNode) => void,
  matchedTagIds: Set<number>
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
        <span className={`antMaterialTreeTitle noCount ${matchedTagIds.has(node.id) ? "matched" : ""}`}>
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
      children: tagTreeData(node.children || [], query, selectedTagIds, onToggle, matchedTagIds)
    }));
}

function tagMatches(node: TagTreeNode, normalizedQuery: string) {
  return (
    node.tagName.toLowerCase().includes(normalizedQuery) ||
    node.tagKey.toLowerCase().includes(normalizedQuery)
  );
}

function collectSearchTagState(nodes: TagTreeNode[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const expandedKeys = new Set<string>();
  const matchedTagIds = new Set<number>();

  function visit(node: TagTreeNode, parentIds: string[]) {
    const selfMatched = normalizedQuery ? tagMatches(node, normalizedQuery) : false;
    let childMatched = false;

    for (const child of node.children || []) {
      if (visit(child, [...parentIds, String(node.id)])) childMatched = true;
    }

    if (selfMatched) {
      matchedTagIds.add(node.id);
      parentIds.forEach((id) => expandedKeys.add(id));
      if ((node.children || []).length > 0) expandedKeys.add(String(node.id));
    }
    if (childMatched) expandedKeys.add(String(node.id));

    return selfMatched || childMatched;
  }

  nodes.forEach((node) => visit(node, []));
  return { expandedKeys: Array.from(expandedKeys), matchedTagIds };
}

export function MaterialUploadPanel() {
  const uploadStartedRef = useRef(false);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [bizTypes, setBizTypes] = useState<BizTypeTreeNode[]>([]);
  const [tags, setTags] = useState<TagTreeNode[]>([]);
  const [selectedBizTypeId, setSelectedBizTypeId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagTreeNode[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [expandedTagKeys, setExpandedTagKeys] = useState<string[]>([]);
  const [autoExpandTagParent, setAutoExpandTagParent] = useState(true);
  const [tasks, setTasks] = useState<MaterialTask[]>([]);
  const [products, setProducts] = useState<ProductCardResult[]>([]);
  const [productPage, setProductPage] = useState<ProductPageResult | null>(null);
  const [fileNameQuery, setFileNameQuery] = useState("");
  const [fileNameFilter, setFileNameFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductCardResult | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);
  const [reRecognizingRawIds, setReRecognizingRawIds] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("加载素材配置中");
  const [error, setError] = useState("");

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.rawId && task.status === "processing")
        .map((task) => task.rawId as number)
        .sort((left, right) => left - right),
    [tasks]
  );
  const activeTaskIdsKey = activeTasks.join(",");

  const selectedTagIds = useMemo(() => new Set(selectedTags.map((tag) => tag.id)), [selectedTags]);
  const selectedTagKeys = selectedTags.map((tag) => String(tag.id));
  const tagSearchState = useMemo(() => collectSearchTagState(tags, tagQuery), [tags, tagQuery]);
  const selectedBizTypeName = useMemo(() => {
    const selectedBizType = flattenBizTypes(bizTypes).find((type) => type.id === selectedBizTypeId);
    return selectedBizType?.typeName || "素材";
  }, [bizTypes, selectedBizTypeId]);

  const productCards = useMemo<LibraryCard[]>(() => {
    return products.map((product) => {
      const matchedTags = product.matchedTags?.length ? product.matchedTags : product.matchedTag ? [product.matchedTag] : [];
      const allTags = product.tags?.length ? product.tags : matchedTags;
      return {
        key: `product-${product.productId}`,
        title: product.fileName || `素材 #${product.rawId}`,
        subtitle: `${selectedBizTypeName}标签：`,
        imageUrl: product.thumbnailUrl || product.fileUrl,
        status: productAiStatusLabel(product.aiStatus),
        tags: allTags,
        matchedTagIds: new Set(matchedTags.map((tag) => tag.tagId)),
        time: formatTime(product.createdAt),
        product
      };
    });
  }, [products, selectedBizTypeName]);

  const productDisplayCount = productPage?.total ?? productCards.length;
  const selectedProductTags = useMemo(() => {
    const tags = selectedProduct?.tags || [];
    return [...tags].sort((a, b) => confidencePercent(b.confidence) - confidencePercent(a.confidence));
  }, [selectedProduct]);

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

  function submitFileNameSearch() {
    setFileNameFilter(fileNameQuery.trim());
  }

  function openProductDetail(product: ProductCardResult) {
    setSelectedProduct(product);
    setPreviewScale(1);
    setPreviewSize(null);
  }

  function pushProductToAiImage(product: ProductCardResult) {
    window.localStorage.setItem(IMAGE2_REFERENCE_STORAGE_KEY, JSON.stringify(product));
    window.location.href = withBasePath(`/admin/ai-image?referenceRawId=${encodeURIComponent(String(product.rawId))}`);
  }

  async function reRecognizeProduct(product: ProductCardResult) {
    if (!product.rawId) {
      message.warning("素材 rawId 为空，无法重新识别");
      return;
    }

    setReRecognizingRawIds((current) => new Set(current).add(product.rawId));
    try {
      const response = await fetch(withBasePath("/api/materials/re-recognize"), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ rawId: product.rawId }),
        cache: "no-store"
      });
      const payload = (await response.json()) as ApiResponse<ImageReRecognizeResult>;
      if (payload.code !== 200 || !payload.data) {
        throw new Error(payload.message || "重新识别提交失败");
      }

      setProducts((current) =>
        current.map((item) =>
          item.rawId === product.rawId
            ? {
                ...item,
                aiStatus: 0,
                matchedTag: undefined,
                matchedTags: [],
                tags: []
              }
            : item
        )
      );
      setTasks((current) => [
        {
          id: `raw-${product.rawId}`,
          fileName: product.fileName || `素材 #${product.rawId}`,
          fileSize: product.fileSize || 0,
          previewUrl: product.thumbnailUrl || product.fileUrl,
          rawId: product.rawId,
          status: "processing" as const,
          progress: 48,
          message: payload.data.message || "AI 重新识别处理中",
          createdAt: new Date().toISOString()
        },
        ...current.filter((task) => task.rawId !== product.rawId)
      ].slice(0, 10));
      message.success(payload.data.message || "AI 重新识别已提交");
      await refreshRawResults([product.rawId]);
      await refreshRecentTasks();
    } catch (recognizeError) {
      message.error(recognizeError instanceof Error ? recognizeError.message : "重新识别提交失败");
    } finally {
      setReRecognizingRawIds((current) => {
        const next = new Set(current);
        next.delete(product.rawId);
        return next;
      });
    }
  }

  async function copySelectedProductUrl() {
    if (!selectedProduct?.fileUrl) {
      message.warning("暂无可复制的图片地址");
      return;
    }

    try {
      const copied = await copyTextToClipboard(selectedProduct.fileUrl);
      if (copied) {
        message.success("图片地址已复制");
        return;
      }
    } catch {
      // Fall through to the manual copy dialog for non-secure HTTP pages.
    }

    Modal.info({
      title: "手动复制图片地址",
      width: 560,
      okText: "知道了",
      content: (
        <div className="manualCopyDialog">
          <p>当前浏览器环境不允许自动复制，请手动复制下面的图片地址。</p>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            readOnly
            value={selectedProduct.fileUrl}
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
          />
        </div>
      )
    });
  }

  async function downloadSelectedProductOriginal() {
    if (!selectedProduct?.rawId) {
      message.warning("暂无可下载的原图");
      return;
    }

    try {
      const response = await fetch(
        withBasePath(`/api/materials/download-original?rawId=${encodeURIComponent(String(selectedProduct.rawId))}`)
      );
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        filenameFromContentDisposition(response.headers.get("content-disposition")) ||
        selectedProduct.fileName ||
        `material-${selectedProduct.rawId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (downloadError) {
      console.error(downloadError);
      message.error("原图下载失败");
    }
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
      setSelectedTags((current) => (current.length ? [] : current));
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
        setExpandedTagKeys([]);
        setAutoExpandTagParent(false);
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
    if (tagQuery.trim()) {
      setExpandedTagKeys(tagSearchState.expandedKeys);
      setAutoExpandTagParent(true);
      return;
    }

    setExpandedTagKeys([]);
    setAutoExpandTagParent(false);
  }, [tagQuery, tagSearchState.expandedKeys, tags]);

  const refreshProducts = useCallback(async () => {
    if (!selectedBizTypeId) {
      setProducts([]);
      setProductPage(null);
      return;
    }
    const tagIds = selectedTags.map((tag) => tag.id);
    const fileName = fileNameFilter.trim();

    try {
      const response = await fetch(withBasePath("/api/materials/products"), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ bizTypeId: selectedBizTypeId, tagIds, fileName, page: 1, pageSize: 20 }),
        cache: "no-store"
      });
      const payload = (await response.json()) as ApiResponse<ProductPageResult>;
      if (payload.code !== 200 || !payload.data) {
        throw new Error(payload.message || "素材列表加载失败");
      }
      setProductPage(payload.data);
      setProducts(payload.data.records || []);
    } catch (loadError) {
      setProducts([]);
      setProductPage(null);
      setError(loadError instanceof Error ? loadError.message : "素材列表加载失败");
    }
  }, [fileNameFilter, selectedBizTypeId, selectedTags]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const refreshRecentTasks = useCallback(async () => {
    try {
      const response = await fetch(withBasePath("/api/materials/recent-tasks"), {
        cache: "no-store"
      });
      const payload = (await response.json()) as ApiResponse<ImageRawResult[]>;
      if (payload.code !== 200 || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "最近任务加载失败");
      }

      setTasks((current) => {
        const currentByRawId = new Map(
          current
            .filter((task) => task.rawId)
            .map((task) => [task.rawId as number, task] as const)
        );
        const rawTasks = payload.data.map((result) => taskFromRawResult(result, currentByRawId.get(result.rawId)));
        const rawTaskIds = new Set(rawTasks.map((task) => task.rawId));
        const transientTasks = current.filter(
          (task) => !task.rawId || (!rawTaskIds.has(task.rawId) && task.status === "uploading")
        );
        return [...transientTasks, ...rawTasks].slice(0, 10);
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "最近任务加载失败");
    }
  }, []);

  useEffect(() => {
    void refreshRecentTasks();
  }, [refreshRecentTasks]);

  const mergeRawResults = useCallback((results: ImageRawResult[]) => {
    const hasDoneResult = results.some((result) => normalizeStatus(result.status) === "done");
    setTasks((current) =>
      current.map((task) => {
        const result = results.find((entry) => entry.rawId === task.rawId);
        if (!result) return task;
        return {
          ...taskFromRawResult(result, task),
          id: task.id
        };
      })
    );
    if (hasDoneResult) {
      window.setTimeout(() => {
        void refreshProducts();
        void refreshRecentTasks();
      }, 0);
    }
  }, [refreshProducts, refreshRecentTasks]);

  useEffect(() => {
    if (!activeTaskIdsKey) return;
    let disposed = false;

    async function tick() {
      try {
        const response = await fetch(withBasePath(`/api/materials/list?rawIds=${activeTaskIdsKey}`), {
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

    const timer = window.setInterval(tick, TASK_STATUS_POLL_INTERVAL_MS);
    void tick();

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [activeTaskIdsKey, mergeRawResults]);

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
      await refreshRecentTasks();
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "上传失败";
      setError(message);
      setTasks((current) =>
        current.map((task) =>
          localTasks.some((localTask) => localTask.id === task.id)
            ? { ...task, status: "upload_failed", progress: 100, message }
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

      {error ? <Alert title={error} type="warning" closable onClose={() => setError("")} /> : null}

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
            autoExpandParent={autoExpandTagParent}
            expandedKeys={expandedTagKeys}
            selectedKeys={selectedTagKeys}
            treeData={tagTreeData(tags, tagQuery, selectedTagIds, toggleSelectedTag, tagSearchState.matchedTagIds)}
            onExpand={(keys) => {
              setExpandedTagKeys(keys.map(String));
              setAutoExpandTagParent(false);
            }}
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
              <span className="libraryCount">共 {productDisplayCount} 条</span>
            </Space>
          }
        >
          <div className="antMaterialToolbar">
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索文件名"
              value={fileNameQuery}
              onChange={(event) => setFileNameQuery(event.target.value)}
              onPressEnter={submitFileNameSearch}
            />
            <Button type="primary" icon={<Search size={15} />} onClick={submitFileNameSearch}>
              搜索
            </Button>
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
            <p className="ant-upload-hint">支持 jpg、png、webp；单次最多 10 张，单次最大 100M</p>
          </Dragger>

          <section className="antRecentTasks">
            <div className="recentTitle">最近任务</div>
            {tasks.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="上传图片后会显示异步识别进度" />
            ) : (
              <div className="recentTaskList">
                {tasks.map((task) => (
                  <div className="antTaskRow" key={task.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={task.result?.thumbnailUrl || task.previewUrl} alt={task.fileName} />
                    <strong>{task.fileName}</strong>
                    <span className="taskFileSize">{formatSize(task.result?.fileSize || task.fileSize)}</span>
                    <Badge status={task.status === "failed" || task.status === "upload_failed" ? "error" : task.status === "done" ? "success" : "processing"} text={taskStatusLabel(task.status)} />
                    <Progress percent={task.progress} showInfo={false} strokeColor={task.status === "done" ? "#009a82" : "#1677ff"} />
                    <time>{formatTime(task.createdAt)}</time>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="antProductSection">
            <div className="productSectionHeader">
              <span>产品素材</span>
              <small>{productDisplayCount} 个结果</small>
            </div>
            <div className="antLibraryGrid">
              {productCards.length === 0 ? (
                <Empty description={selectedTags.length > 0 ? "当前标签暂无素材" : "请选择标签或上传素材"} />
              ) : (
                productCards.map((card) => (
                  <Card
                    hoverable
                    size="small"
                    key={card.key}
                    className="antLibraryItem"
                    onClick={() => openProductDetail(card.product)}
                  cover={
                      <div className="antLibraryCover">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={card.imageUrl} alt={card.title} />
                        <Button
                          className="coverMore"
                          icon={<MoreVertical size={14} />}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </div>
                    }
                  >
                    <div className="libraryItemTitle">
                      <strong>{card.title}</strong>
                      <Tag color={productAiStatusTagColor(card.product.aiStatus)}>{card.status}</Tag>
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
                      <Space className="libraryCardActions" size={4}>
                        <Tooltip title="重新识别标签">
                          <Button
                            aria-label="重新识别标签"
                            icon={<RefreshCw size={14} />}
                            loading={reRecognizingRawIds.has(card.product.rawId)}
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              void reRecognizeProduct(card.product);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="推送到 AI 生图参考图">
                          <Button
                            aria-label="推送到 AI 生图参考图"
                            icon={<Send size={14} />}
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              pushProductToAiImage(card.product);
                            }}
                          />
                        </Tooltip>
                      </Space>
                      <time>{card.time}</time>
                    </footer>
                  </Card>
                ))
              )}
            </div>
          </section>
        </Card>
      </div>

      <Drawer
        rootClassName="materialDetailDrawerRoot"
        className="materialDetailDrawer"
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        destroyOnClose
        title={
          selectedProduct ? (
            <div className="detailDrawerTitle">
              <strong>素材详情</strong>
              <span>{selectedProduct.fileName || `素材 #${selectedProduct.rawId}`}</span>
            </div>
          ) : null
        }
        extra={
          selectedProduct ? (
            <Space className="detailHeaderActions" size={8}>
              <Tag color={productAiStatusTagColor(selectedProduct.aiStatus)}>{productAiStatusLabel(selectedProduct.aiStatus)}</Tag>
              <Tooltip title="下载原图">
                <Button
                  type="primary"
                  aria-label="下载原图"
                  icon={<Download size={15} />}
                  onClick={() => void downloadSelectedProductOriginal()}
                />
              </Tooltip>
              <Tooltip title="复制图片地址">
                <Button
                  aria-label="复制图片地址"
                  icon={<Copy size={15} />}
                  onClick={() => void copySelectedProductUrl()}
                />
              </Tooltip>
            </Space>
          ) : null
        }
      >
        {selectedProduct ? (
          <div className="materialDetailContent">
            <section className="detailSection">
              <h3>缩略图预览</h3>
              <div className="detailImageFrame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.thumbnailUrl || selectedProduct.fileUrl}
                  alt={selectedProduct.fileName}
                  style={{ transform: `scale(${previewScale})` }}
                  onLoad={(event) => {
                    setPreviewSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight
                    });
                  }}
                />
              </div>
              <div className="detailPreviewToolbar">
                <Button
                  icon={<ZoomOut size={14} />}
                  onClick={() => setPreviewScale((scale) => Math.max(0.5, Number((scale - 0.1).toFixed(1))))}
                />
                <span>{Math.round(previewScale * 100)}%</span>
                <Button
                  icon={<ZoomIn size={14} />}
                  onClick={() => setPreviewScale((scale) => Math.min(2, Number((scale + 0.1).toFixed(1))))}
                />
                <Button icon={<Maximize2 size={14} />} onClick={() => setPreviewScale(1)}>
                  适应窗口
                </Button>
              </div>
            </section>

            <section className="detailSection">
              <h3>文件信息</h3>
              <div className="detailInfoGrid">
                <div>
                  <span>raw_id</span>
                  <strong>{selectedProduct.rawId}</strong>
                </div>
                <div>
                  <span>预览尺寸</span>
                  <strong>{previewSize ? `${previewSize.width} x ${previewSize.height}` : "--"}</strong>
                </div>
                <div>
                  <span>文件大小</span>
                  <strong>{formatSize(selectedProduct.fileSize || 0)}</strong>
                </div>
                <div>
                  <span>来源</span>
                  <strong>上传</strong>
                </div>
                <div>
                  <span>格式</span>
                  <strong>{fileExtFromName(selectedProduct.fileName)}</strong>
                </div>
                <div>
                  <span>入库时间</span>
                  <strong>{formatTime(selectedProduct.createdAt)}</strong>
                </div>
              </div>
            </section>

            <section className="detailSection">
              <div className="detailSectionHeader">
                <h3>AI 识别结果 <span>共 {selectedProductTags.length} 个</span></h3>
                <p>进度条表示 AI 对该标签的置信度</p>
              </div>
              <div className="detailAiList">
                {selectedProductTags.length === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无识别标签" />
                ) : (
                  selectedProductTags.map((tag) => {
                    const percent = confidencePercent(tag.confidence);
                    return (
                      <div className="detailAiRow" key={tag.tagId}>
                        <Tag>{tag.tagName}</Tag>
                        <span>{percent ? `${percent}%` : "--"}</span>
                        <Progress
                          percent={percent}
                          showInfo={false}
                          strokeColor={confidenceColor(percent)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}
