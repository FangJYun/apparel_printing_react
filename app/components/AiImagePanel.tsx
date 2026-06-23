"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge, Button, Card, Empty, Input, Modal, Popover, Progress, Select, Skeleton, Space, Tag, Tooltip, message } from "antd";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  ImagePlus,
  LoaderCircle,
  MoreVertical,
  Save,
  Search,
  Shapes,
  Sparkles,
  Trash2
} from "lucide-react";
import { withBasePath } from "../path";
import { TagTreePicker } from "./TagTreePicker";

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

type ImageTagResult = {
  tagId: number;
  tagKey: string;
  tagName: string;
  confidence: number | null;
};

type ProductCardResult = {
  productId: number;
  rawId: number;
  bizTypeId: number;
  status: number;
  createdAt: string;
  fileName: string;
  fileSize?: number;
  fileUrl: string;
  thumbnailUrl: string;
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

type Image2SizeConfigResult = {
  sizeConfigId: number;
  bizTypeId: number;
  modelName: string;
  aspectRatio: string;
  width: number;
  height: number;
  size: string;
  sortOrder: number;
  isDefault: number;
};

type ImageGenerationModelResult = {
  code: string;
  modelName: string;
  displayName: string;
  description: string;
  defaultModel: boolean;
};

type Image2GenerateTaskResult = {
  taskId: number;
  taskNo: string;
  status: number;
  message: string;
};

type Image2TaskImageResult = {
  index: number;
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
  saved?: boolean;
  savedRawId?: number;
  savedFileUrl?: string;
  savedThumbnailUrl?: string;
};

type Image2TaskDetailResult = {
  taskId: number;
  taskNo: string;
  referenceRawId: number;
  referenceFileName?: string;
  referenceThumbnailUrl?: string;
  bizTypeId: number;
  prompt: string;
  negativePrompt?: string;
  size: string;
  aspectRatio?: string;
  requestCount: number;
  successCount: number;
  modelName?: string;
  status: number;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
  tags: ImageTagResult[];
  images: Image2TaskImageResult[];
};

type ImageUploadResult = {
  rawId: number;
  status: number;
  message: string;
};

const countOptions = [1, 2, 3, 4];

function flattenBizTypes(nodes: BizTypeTreeNode[]): BizTypeTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenBizTypes(node.children || [])]);
}

function findPrintBizType(nodes: BizTypeTreeNode[]) {
  return flattenBizTypes(nodes).find((node) => node.typeKey === "print") || flattenBizTypes(nodes)[0];
}

function formatTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatSize(size?: number) {
  if (!Number.isFinite(size || NaN) || !size || size <= 0) return "--";
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function imageSource(image: Image2TaskImageResult) {
  if (image.b64Json) {
    return image.b64Json.startsWith("data:") ? image.b64Json : `data:image/png;base64,${image.b64Json}`;
  }
  return image.savedThumbnailUrl || image.savedFileUrl || image.url || "";
}

function statusLabel(status: number) {
  if (status === 0) return "待生成";
  if (status === 1) return "生成中";
  if (status === 2) return "已完成";
  if (status === 3) return "失败";
  if (status === 4) return "已取消";
  return "未知";
}

function statusBadge(status: number) {
  if (status === 2) return "success";
  if (status === 3 || status === 4) return "error";
  if (status === 1) return "processing";
  return "default";
}

function progressFromStatus(status: number) {
  if (status === 2) return 100;
  if (status === 3 || status === 4) return 100;
  if (status === 1) return 62;
  return 18;
}

function progressColor(status: number) {
  if (status === 3 || status === 4) return "#ef4444";
  if (status === 2) return "#12a87d";
  if (status === 1) return "#1677ff";
  return "#98a2b3";
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

async function apiJson<T>(url: string, options?: RequestInit) {
  const response = await fetch(withBasePath(url), {
    cache: "no-store",
    ...options,
    headers: {
      ...(options?.body ? { "content-type": "application/json" } : {}),
      ...(options?.headers || {})
    }
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (payload.code !== 200) {
    throw new Error(payload.message || "接口请求失败");
  }
  return payload.data;
}

function collectBizTypeFolderIds(nodes: BizTypeTreeNode[]): number[] {
  return nodes.flatMap((node) => {
    const children = node.children || [];
    return children.length ? [node.id, ...collectBizTypeFolderIds(children)] : [];
  });
}

function filterBizTypeTree(nodes: BizTypeTreeNode[], keyword: string): BizTypeTreeNode[] {
  const term = keyword.trim().toLowerCase();
  if (!term) return nodes;

  return nodes
    .map((node) => {
      const children = filterBizTypeTree(node.children || [], keyword);
      const matched = node.typeName.toLowerCase().includes(term) || node.typeKey.toLowerCase().includes(term);
      if (!matched && !children.length) return null;
      return {
        ...node,
        children: matched ? node.children || [] : children
      };
    })
    .filter((node): node is BizTypeTreeNode => Boolean(node));
}

type BusinessTypePickerProps = {
  bizTypes: BizTypeTreeNode[];
  value: number | null;
  onConfirm: (value: number) => void;
};

function BusinessTypePicker({ bizTypes, value, onConfirm }: BusinessTypePickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [draftValue, setDraftValue] = useState<number | null>(value);
  const [expandedIds, setExpandedIds] = useState<number[]>(() => collectBizTypeFolderIds(bizTypes));

  const allBizTypes = useMemo(() => flattenBizTypes(bizTypes), [bizTypes]);
  const selectedBizType = useMemo(() => allBizTypes.find((item) => item.id === value) || null, [allBizTypes, value]);
  const visibleBizTypes = useMemo(() => filterBizTypeTree(bizTypes, keyword), [bizTypes, keyword]);
  const searchMode = Boolean(keyword.trim());
  const expandedSet = useMemo(
    () => new Set(searchMode ? collectBizTypeFolderIds(visibleBizTypes) : expandedIds),
    [expandedIds, searchMode, visibleBizTypes]
  );

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    setExpandedIds(collectBizTypeFolderIds(bizTypes));
  }, [bizTypes]);

  function toggleExpanded(id: number) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function renderNodes(nodes: BizTypeTreeNode[], depth = 0): ReactNode {
    return nodes.map((node) => {
      const children = node.children || [];
      const hasChildren = children.length > 0;
      const expanded = expandedSet.has(node.id);
      const selected = node.id === draftValue;

      return (
        <div className="bizTypePickerNode" key={node.id}>
          <button
            className={selected ? "bizTypePickerRow active" : "bizTypePickerRow"}
            style={{ paddingLeft: 12 + depth * 34 }}
            type="button"
            onClick={() => setDraftValue(node.id)}
          >
            {hasChildren ? (
              <span
                className="bizTypePickerToggle"
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleExpanded(node.id);
                  }
                }}
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            ) : (
              <span className="bizTypePickerToggle" />
            )}
            {hasChildren ? <Folder size={20} /> : <FileText size={20} />}
            <span>{node.typeName}</span>
            {selected ? <Check className="bizTypePickerCheck" size={18} /> : null}
          </button>
          {hasChildren && expanded ? renderNodes(children, depth + 1) : null}
        </div>
      );
    });
  }

  const content = (
    <div className="bizTypePickerPanel">
      <Input
        className="bizTypePickerSearch"
        prefix={<Search size={18} />}
        value={keyword}
        placeholder="搜索业务类型"
        onChange={(event) => setKeyword(event.target.value)}
      />
      <div className="bizTypePickerTree">
        {visibleBizTypes.length ? renderNodes(visibleBizTypes) : <Empty description="暂无匹配业务类型" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </div>
      <footer className="bizTypePickerFooter">
        <span>
          <AlertCircle size={18} />
          切换后将清空已选参考图和标签
        </span>
        <Button onClick={() => setOpen(false)}>取消</Button>
        <Button
          type="primary"
          disabled={!draftValue}
          onClick={() => {
            if (!draftValue) return;
            onConfirm(draftValue);
            setOpen(false);
          }}
        >
          确认
        </Button>
      </footer>
    </div>
  );

  return (
    <Popover
      arrow={false}
      content={content}
      open={open}
      overlayClassName="bizTypePickerPopover"
      placement="bottomLeft"
      trigger="click"
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setDraftValue(value);
          setKeyword("");
        }
      }}
    >
      <button className="aiBizTypeTrigger" type="button">
        <Shapes size={16} />
        <span>选择业务类型</span>
        <span>{selectedBizType?.typeName || "请选择"}</span>
        <ChevronRight size={16} />
      </button>
    </Popover>
  );
}

export function AiImagePanel() {
  const [bizTypes, setBizTypes] = useState<BizTypeTreeNode[]>([]);
  const [bizTypeId, setBizTypeId] = useState<number | null>(null);
  const [tags, setTags] = useState<TagTreeNode[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [sizeConfigs, setSizeConfigs] = useState<Image2SizeConfigResult[]>([]);
  const [sizeConfigId, setSizeConfigId] = useState<number | null>(null);
  const [models, setModels] = useState<ImageGenerationModelResult[]>([]);
  const [selectedModelName, setSelectedModelName] = useState("");
  const [products, setProducts] = useState<ProductCardResult[]>([]);
  const [referenceProduct, setReferenceProduct] = useState<ProductCardResult | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [count, setCount] = useState(1);
  const [currentTask, setCurrentTask] = useState<Image2TaskDetailResult | null>(null);
  const [recentTasks, setRecentTasks] = useState<Image2TaskDetailResult[]>([]);
  const [previewImage, setPreviewImage] = useState<Image2TaskImageResult | null>(null);
  const [referenceModalOpen, setReferenceModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState("");
  const [sizeConfigError, setSizeConfigError] = useState("");
  const [generating, setGenerating] = useState(false);

  const currentImages = currentTask?.images || [];
  const isTaskRunning = currentTask ? currentTask.status === 0 || currentTask.status === 1 : false;
  const currentStatus = currentTask?.status ?? (generating ? 1 : 0);
  const referenceBizTypeId = referenceProduct?.bizTypeId || bizTypeId;
  const selectedModel = models.find((model) => model.modelName === selectedModelName) || models[0] || null;
  const visibleSizeConfigs = useMemo(() => {
    if (!selectedModelName) return sizeConfigs;
    const matched = sizeConfigs.filter((item) => item.modelName === selectedModelName);
    return matched.length ? matched : sizeConfigs;
  }, [selectedModelName, sizeConfigs]);

  const loadRecentTasks = useCallback(async () => {
    const data = await apiJson<Image2TaskDetailResult[]>("/api/image2/recent-tasks?limit=10");
    setRecentTasks(Array.isArray(data) ? data : []);
  }, []);

  const loadTaskDetail = useCallback(async (taskId: number) => {
    const detail = await apiJson<Image2TaskDetailResult>(`/api/image2/task-detail?taskId=${taskId}`);
    setCurrentTask(detail);
    return detail;
  }, []);

  useEffect(() => {
    let disposed = false;

    async function bootstrap() {
      setLoading("加载 AI 生图配置中");
      try {
        const [bizTypeData, modelData] = await Promise.all([
          apiJson<BizTypeTreeNode[]>("/api/materials/biz-types"),
          apiJson<ImageGenerationModelResult[]>("/api/image2/models")
        ]);
        if (disposed) return;
        setBizTypes(bizTypeData || []);
        setBizTypeId(findPrintBizType(bizTypeData)?.id || null);
        setModels(modelData || []);
        setSelectedModelName(
          (modelData || []).find((model) => model.defaultModel)?.modelName || modelData?.[0]?.modelName || ""
        );
      } catch (error) {
        message.error(error instanceof Error ? error.message : "AI 生图基础配置加载失败");
      } finally {
        if (!disposed) setLoading("");
      }
    }

    void bootstrap();
    void loadRecentTasks().catch(() => undefined);
    return () => {
      disposed = true;
    };
  }, [loadRecentTasks]);

  useEffect(() => {
    if (!bizTypeId) return;
    let disposed = false;

    async function loadReferenceProducts() {
      setLoading("加载参考素材中");
      try {
        const productData = await apiJson<ProductPageResult>("/api/materials/products", {
          method: "POST",
          body: JSON.stringify({ bizTypeId, tagIds: [], page: 1, pageSize: 20 })
        });
        if (disposed) return;
        const records = productData?.records || [];
        setProducts(records);
      } catch (error) {
        if (!disposed) message.error(error instanceof Error ? error.message : "参考素材加载失败");
      } finally {
        if (!disposed) setLoading("");
      }
    }

    void loadReferenceProducts();
    return () => {
      disposed = true;
    };
  }, [bizTypeId]);

  useEffect(() => {
    if (!referenceBizTypeId) return;
    let disposed = false;

    async function loadReferenceConfig() {
      setLoading("加载标签和尺寸配置中");
      try {
        const [tagResult, sizeResult] = await Promise.allSettled([
          apiJson<TagTreeNode[]>(`/api/materials/tags?bizTypeId=${referenceBizTypeId}`),
          apiJson<Image2SizeConfigResult[]>(`/api/image2/size-configs?bizTypeId=${referenceBizTypeId}`)
        ]);
        if (disposed) return;

        setSelectedTagIds([]);
        if (tagResult.status === "fulfilled") {
          setTags(tagResult.value || []);
        } else {
          message.error(tagResult.reason instanceof Error ? tagResult.reason.message : "标签加载失败");
        }

        if (sizeResult.status === "fulfilled") {
          setSizeConfigError("");
          setSizeConfigs(sizeResult.value || []);
          const nextVisibleConfigs = selectedModelName
            ? (sizeResult.value || []).filter((item) => item.modelName === selectedModelName)
            : sizeResult.value || [];
          const candidateConfigs = nextVisibleConfigs.length ? nextVisibleConfigs : sizeResult.value || [];
          setSizeConfigId(
            candidateConfigs.find((item) => item.isDefault === 1)?.sizeConfigId ||
              candidateConfigs[0]?.sizeConfigId ||
              null
          );
        } else {
          setSizeConfigs([]);
          setSizeConfigId(null);
          setSizeConfigError(sizeResult.reason instanceof Error ? sizeResult.reason.message : "尺寸配置加载失败");
        }
      } catch (error) {
        if (!disposed) message.error(error instanceof Error ? error.message : "标签和尺寸配置加载失败");
      } finally {
        if (!disposed) setLoading("");
      }
    }

    void loadReferenceConfig();
    return () => {
      disposed = true;
    };
  }, [referenceBizTypeId, selectedModelName]);

  useEffect(() => {
    if (!currentTask || !isTaskRunning) return;
    const timer = window.setInterval(() => {
      void loadTaskDetail(currentTask.taskId)
        .then((task) => {
          if (task.status === 2 || task.status === 3 || task.status === 4) {
            void loadRecentTasks();
          }
        })
        .catch((error) => message.error(error instanceof Error ? error.message : "任务状态刷新失败"));
    }, 2500);
    return () => window.clearInterval(timer);
  }, [currentTask, isTaskRunning, loadRecentTasks, loadTaskDetail]);

  async function generateImages() {
    if (!referenceProduct) {
      message.warning("请先选择参考图片");
      return;
    }
    if (!referenceBizTypeId || !sizeConfigId) {
      message.warning("尺寸配置还未加载完成");
      return;
    }
    if (!prompt.trim()) {
      message.warning("请输入提示词");
      return;
    }

    setGenerating(true);
    try {
      const result = await apiJson<Image2GenerateTaskResult>("/api/image2/generate-task", {
        method: "POST",
        body: JSON.stringify({
          referenceRawId: referenceProduct.rawId,
          bizTypeId: referenceBizTypeId,
          modelName: selectedModel?.modelName,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
          sizeConfigId,
          count,
          tagIds: selectedTagIds
        })
      });
      message.success(result.message || "AI 生图任务已提交");
      await loadTaskDetail(result.taskId);
      await loadRecentTasks();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "AI 生图任务提交失败");
    } finally {
      setGenerating(false);
    }
  }

  async function saveResult(image: Image2TaskImageResult) {
    if (!currentTask) return;
    try {
      const result = await apiJson<ImageUploadResult>("/api/image2/save-result", {
        method: "POST",
        body: JSON.stringify({ taskId: currentTask.taskId, imageIndex: image.index })
      });
      message.success(result.message || "已保存到素材库");
      await loadTaskDetail(currentTask.taskId);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存生成结果失败");
    }
  }

  async function downloadResult(image: Image2TaskImageResult) {
    if (!currentTask) return;
    try {
      const response = await fetch(
        withBasePath(`/api/image2/download-result?taskId=${currentTask.taskId}&imageIndex=${image.index}`)
      );
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        filenameFromContentDisposition(response.headers.get("content-disposition")) ||
        `image2-${currentTask.taskNo}-${image.index}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error(error);
      message.error("下载生成图失败");
    }
  }

  async function saveTemplate() {
    if (!referenceBizTypeId || !sizeConfigId) return;
    if (!templateName.trim()) {
      message.warning("请输入模板名称");
      return;
    }
    try {
      await apiJson("/api/image2/template/save", {
        method: "POST",
        body: JSON.stringify({
          templateName: templateName.trim(),
          referenceRawId: referenceProduct?.rawId || 0,
          bizTypeId: referenceBizTypeId,
          modelName: selectedModel?.modelName,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
          sizeConfigId,
          count,
          tagIds: selectedTagIds
        })
      });
      message.success("模板保存成功");
      setTemplateModalOpen(false);
      setTemplateName("");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "模板保存失败");
    }
  }

  return (
    <section className="aiImageStudio">
      <header className="aiImageHeader">
        <h1>AI 生图</h1>
        <p>根据参考图、标签与提示词生成印花素材</p>
      </header>

      <div className="aiImageLayout">
        <Card title="生成设置" className="aiImageSettings">
          <div className="aiSettingsScroll">
            <section className="aiSettingBlock">
              <h2>1. 业务类型</h2>
              <BusinessTypePicker
                bizTypes={bizTypes}
                value={bizTypeId}
                onConfirm={(value) => {
                  if (value === bizTypeId) return;
                  setBizTypeId(value);
                  setReferenceProduct(null);
                  setSelectedTagIds([]);
                }}
              />
              <span className="mutedInline">参考图与标签将按当前业务类型加载</span>
            </section>

            <section className="aiSettingBlock">
              <h2>2. 参考图片</h2>
              {referenceProduct ? (
                <div className="referenceMaterial">
                  <div className="referenceCover">
                    <img src={referenceProduct.thumbnailUrl || referenceProduct.fileUrl} alt={referenceProduct.fileName} />
                    <div className="referenceCoverActions">
                      <Tooltip title="更换参考图片">
                        <Button
                          aria-label="更换参考图片"
                          icon={<ImagePlus size={15} />}
                          size="small"
                          type="text"
                          onClick={() => setReferenceModalOpen(true)}
                        />
                      </Tooltip>
                      <Tooltip title="清空参考图片">
                        <Button
                          aria-label="清空参考图片"
                          icon={<Trash2 size={15} />}
                          size="small"
                          type="text"
                          onClick={() => setReferenceProduct(null)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  <div>
                    <Tooltip title={referenceProduct.fileName}>
                      <strong>{referenceProduct.fileName}</strong>
                    </Tooltip>
                    <p>素材库 · 印花 · {formatSize(referenceProduct.fileSize)}</p>
                    <div className="aiTagCloud">
                      {(referenceProduct.tags || referenceProduct.matchedTags || []).slice(0, 5).map((tag) => (
                        <Tag key={tag.tagId}>{tag.tagName}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button className="emptyReferenceButton" type="button" onClick={() => setReferenceModalOpen(true)}>
                  <ImagePlus size={22} />
                  选择参考图片
                </button>
              )}
            </section>

            <section className="aiSettingBlock">
              <h2>3. 标签选择</h2>
              <TagTreePicker nodes={tags} value={selectedTagIds} onChange={setSelectedTagIds} />
              <span className="mutedInline">可选择叶子标签增强生成方向</span>
            </section>

            <section className="aiSettingBlock">
              <h2>4. 提示词</h2>
              <label className="aiFieldLabel" htmlFor="image2-prompt">
                正向提示词
              </label>
              <Input.TextArea
                id="image2-prompt"
                value={prompt}
                maxLength={300}
                showCount
                rows={4}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="示例：热带花卉与绿植组合，水彩手绘风格，蓝白色调，满版印花，层次丰富，适用于服装面料设计。"
              />
              <label className="aiFieldLabel" htmlFor="image2-negative-prompt">
                反向提示词（可选）
              </label>
              <Input.TextArea
                id="image2-negative-prompt"
                value={negativePrompt}
                maxLength={200}
                showCount
                rows={2}
                onChange={(event) => setNegativePrompt(event.target.value)}
                placeholder="示例：不要文字、水印、低清晰度"
              />
            </section>

            <section className="aiSettingBlock">
              <h2>5. 模型选择</h2>
              <Select
                className="aiModelSelect"
                value={selectedModelName || undefined}
                placeholder="选择生图模型"
                options={models.map((model) => ({
                  value: model.modelName,
                  label: (
                    <span className="aiModelOption">
                      <strong>{model.displayName || model.modelName}</strong>
                      <small>{model.description || model.modelName}</small>
                    </span>
                  )
                }))}
                onChange={(value) => {
                  setSelectedModelName(value);
                  const nextVisibleConfigs = sizeConfigs.filter((item) => item.modelName === value);
                  const candidateConfigs = nextVisibleConfigs.length ? nextVisibleConfigs : sizeConfigs;
                  setSizeConfigId(
                    candidateConfigs.find((item) => item.isDefault === 1)?.sizeConfigId ||
                      candidateConfigs[0]?.sizeConfigId ||
                      null
                  );
                }}
              />
            </section>

            <section className="aiSettingBlock">
              <h2>6. 图片尺寸</h2>
              <div className="sizeConfigGrid">
                {visibleSizeConfigs.length ? (
                  visibleSizeConfigs.map((item) => (
                    <button
                      className={item.sizeConfigId === sizeConfigId ? "active" : ""}
                      key={item.sizeConfigId}
                      type="button"
                      onClick={() => setSizeConfigId(item.sizeConfigId)}
                    >
                      <strong>{item.aspectRatio || "自定义"}</strong>
                      <span>{item.size}</span>
                    </button>
                  ))
                ) : (
                  <div className="sizeConfigEmpty">
                    <span>{sizeConfigError || "暂无尺寸配置"}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="aiSettingBlock">
              <h2>7. 生成数量</h2>
              <div className="countGrid">
                {countOptions.map((option) => (
                  <button className={option === count ? "active" : ""} key={option} type="button" onClick={() => setCount(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <footer className="aiGenerateActions">
            <Button
              type="primary"
              size="large"
              icon={generating ? <LoaderCircle className="spinIcon" size={18} /> : <Sparkles size={18} />}
              loading={generating}
              disabled={!sizeConfigId}
              onClick={generateImages}
            >
              生成图片
            </Button>
            <Button size="large" icon={<Save size={17} />} onClick={() => setTemplateModalOpen(true)}>
              保存为模板
            </Button>
          </footer>
        </Card>

        <div className="aiImageMain">
          <Card
            title={
              <Space size={18}>
                <span>生成结果</span>
                <small>本次生成 {currentTask?.successCount || currentImages.length || 0} 张</small>
                <Badge status={statusBadge(currentStatus)} text={statusLabel(currentStatus)} />
              </Space>
            }
            extra={
              <Button icon={<Trash2 size={16} />} onClick={() => setCurrentTask(null)}>
                清空结果
              </Button>
            }
            className="aiResultCard"
          >
            {loading && !currentTask ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : currentImages.length ? (
              <div className="aiResultGrid">
                {currentImages.map((image) => (
                  <article className="aiResultItem" key={image.index}>
                    <div className="aiResultCover">
                      <img src={imageSource(image)} alt={`生成结果 ${image.index + 1}`} />
                      <Tag color={image.saved ? "green" : "cyan"}>{image.saved ? "已保存" : "已生成"}</Tag>
                      <Button className="coverMore" icon={<MoreVertical size={15} />} />
                    </div>
                    <footer>
                      <Button icon={<Eye size={16} />} onClick={() => setPreviewImage(image)}>
                        预览
                      </Button>
                      <Button icon={<Save size={16} />} disabled={image.saved} onClick={() => saveResult(image)}>
                        保存
                      </Button>
                      <Button icon={<Download size={16} />} onClick={() => downloadResult(image)}>
                        下载
                      </Button>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="aiResultEmpty">
                <Empty description={isTaskRunning ? "AI 正在生成图片" : "选择参考图并填写提示词后开始生成"} />
                {isTaskRunning ? <Progress percent={progressFromStatus(currentTask?.status || 1)} showInfo={false} /> : null}
              </div>
            )}
          </Card>

          <Card className="aiRecentTaskCard">
            {recentTasks.length ? (
              <div className="aiTaskTable">
                <div className="aiTaskHead">
                  <span>任务 ID</span>
                  <span>参考图</span>
                  <span>提示词</span>
                  <span>数量</span>
                  <span>状态</span>
                  <span>创建时间</span>
                </div>
                <div className="aiTaskRows">
                  {recentTasks.map((task) => (
                    <div className="aiTaskRecord" key={task.taskId}>
                      <span>{task.taskNo}</span>
                      <img src={task.referenceThumbnailUrl || ""} alt={task.referenceFileName || task.taskNo} />
                      <p>{task.prompt}</p>
                      <span>{task.requestCount} 张</span>
                      <span className="aiTaskStatus">
                        <span>{statusLabel(task.status)}</span>
                        <Progress
                          percent={progressFromStatus(task.status)}
                          size="small"
                          showInfo={false}
                          strokeColor={progressColor(task.status)}
                        />
                      </span>
                      <time>{formatTime(task.createdAt)}</time>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="暂无生成任务" />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="选择参考图片"
        open={referenceModalOpen}
        footer={null}
        width={920}
        onCancel={() => setReferenceModalOpen(false)}
      >
        <div className="referencePickerGrid">
          {products.map((product) => (
            <button
              className={referenceProduct?.rawId === product.rawId ? "active" : ""}
              key={product.rawId}
              type="button"
              onClick={() => {
                setReferenceProduct(product);
                setReferenceModalOpen(false);
              }}
            >
              <img src={product.thumbnailUrl || product.fileUrl} alt={product.fileName} />
              <strong>{product.fileName}</strong>
              <span>{formatSize(product.fileSize)}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal title="保存为模板" open={templateModalOpen} onOk={saveTemplate} onCancel={() => setTemplateModalOpen(false)}>
        <Input value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="输入模板名称" />
      </Modal>

      <Modal
        title="生成图预览"
        open={Boolean(previewImage)}
        footer={null}
        width={900}
        onCancel={() => setPreviewImage(null)}
      >
        {previewImage ? <img className="aiPreviewImage" src={imageSource(previewImage)} alt="生成图预览" /> : null}
      </Modal>
    </section>
  );
}
