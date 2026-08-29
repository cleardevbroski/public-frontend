"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Building2,
  MapPin,
  Eye,
  Star,
  UserRound,
  Pencil,
} from "lucide-react";
import { deleteProperty, toggleFeatured, setPropertyStatus } from "@/lib/propertyStore";
import StatusControls from "@/components/admin/StatusControls";
import type { Property } from "@/components/acres/mock-data";
import { getPropertyCoverImage } from "@/lib/propertyPresentation";
import { matchesPropertyAdminSearch } from "@/lib/adminSearch";
import { reviewRecheckProperty } from "@/lib/api";

interface PropertyTableProps {
  properties: Property[];
  adminProperties: Property[];
  initialSearch?: string;
  onPropertyDeleted: () => void;
}

export default function PropertyTable({
  properties,
  adminProperties,
  initialSearch = "",
  onPropertyDeleted,
}: PropertyTableProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filter, setFilter] = useState<"all" | "pending" | "recheck" | "admin" | "mock">("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [now, setNow] = useState(0);
  const perPage = 8;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id0 = setTimeout(tick, 0);
    const t = setInterval(tick, 60000);
    return () => {
      clearTimeout(id0);
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    setSearchQuery(initialSearch);
    setCurrentPage(1);
  }, [initialSearch]);

  const adminIds = new Set(adminProperties.map((p) => p.id));
  const filteredProperties = properties.filter((p) => {
    const matchesSearch = matchesPropertyAdminSearch(p, searchQuery);
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && p.status !== "recheck" && (p.status ? !["approved", "published"].includes(p.status) : p.published === false)) ||
      (filter === "recheck" && p.status === "recheck") ||
      (filter === "admin" && adminIds.has(p.id)) ||
      (filter === "mock" && !adminIds.has(p.id));
    return matchesSearch && matchesFilter;
  }).sort((left, right) => new Date(right.updatedAt || right.postedDate || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.postedDate || left.createdAt || 0).getTime());

  const totalPages = Math.ceil(filteredProperties.length / perPage);
  const paged = filteredProperties.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProperty(id);
      setDeleteModal(null);
      onPropertyDeleted();
    } catch (cause) {
      setDeleteError(cause instanceof Error ? cause.message : "Unable to delete this property.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFeature = async (id: string, currentState: boolean) => {
    await toggleFeatured(id, currentState);
    onPropertyDeleted();
  };

  const handleRecheck = async (id: string, action: "move_to_pending" | "publish") => {
    setWorkflowBusy(id);
    setWorkflowError("");
    try {
      await reviewRecheckProperty(id, action);
      await onPropertyDeleted();
    } catch (cause) {
      setWorkflowError(cause instanceof Error ? cause.message : "Unable to update this Recheck property.");
    } finally {
      setWorkflowBusy(null);
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr || !now) return "—";
    const timestamp = new Date(dateStr).getTime();
    if (!Number.isFinite(timestamp)) return "—";
    const diff = Math.max(0, now - timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E4E0E7]/30 focus-within:border-[#DDAA42]/40 focus-within:ring-2 focus-within:ring-[#DDAA42]/10 transition-all">
          <Search className="w-4 h-4 text-[#68646F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, builder, location, configuration, RERA..."
            className="flex-1 bg-transparent text-[14px] text-[#121B35] placeholder-[#68646F] outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "recheck", "admin", "mock"] as const).map((f) => {
            const pendingCount = properties.filter((p) => p.status !== "recheck" && (p.status ? !["approved", "published"].includes(p.status) : p.published === false)).length;
            const recheckCount = properties.filter((p) => p.status === "recheck").length;
            const label =
              f === "all" ? "All" : f === "pending" ? "Pending" : f === "recheck" ? "Recheck" : f === "admin" ? "Admin Posted" : "Mock Data";
            return (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                    : (f === "pending" && pendingCount > 0) || (f === "recheck" && recheckCount > 0)
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300"
                    : "bg-white text-[#68646F] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                }`}
              >
                {label}
                {f === "pending" && pendingCount > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/25" : "bg-amber-500 text-white"}`}>
                    {pendingCount}
                  </span>
                )}
                {f === "recheck" && recheckCount > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/25" : "bg-blue-600 text-white"}`}>{recheckCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {workflowError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{workflowError}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E4E0E7]/30 bg-white shadow-sm">
        <div className="min-w-0 lg:min-w-[1020px]">
        {/* Header */}
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(110px,0.8fr)_100px_110px_minmax(172px,auto)] gap-4 px-6 py-3 bg-[#F8F7FA] border-b border-[#F3F1F5] text-[11px] font-bold text-[#68646F] uppercase tracking-wider">
          <span>Property</span>
          <span>Location</span>
          <span>Price</span>
          <span>Source</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        {/* Rows */}
        {paged.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-[#E4E0E7] mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-[#68646F]">No properties found</p>
            <p className="text-[13px] text-[#68646F]/70 mt-1">
              {searchQuery ? "Try adjusting your search" : "Post your first property"}
            </p>
          </div>
        ) : (
          paged.map((property) => {
            const isAdmin = adminIds.has(property.id);
            const coverImage = getPropertyCoverImage(property);
            return (
              <div
                key={property.id}
                className="grid min-w-0 grid-cols-1 gap-3 border-b border-[#F3F1F5]/50 px-4 py-4 transition-colors hover:bg-[#F8F7FA]/50 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(110px,0.8fr)_100px_110px_minmax(172px,auto)] lg:items-center lg:gap-4 lg:px-6"
              >
                {/* Property Name + Thumbnail */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F3F1F5] border border-[#E4E0E7]/30">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#E4E0E7]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[14px] font-semibold text-[#121B35] lg:truncate" title={property.title}>{property.title}</p>
                    {property.configs?.length > 0 && (
                      <p className="truncate text-[11px] text-[#68646F]" title={property.configs.join(", ")}>{property.configs.join(", ")}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex min-w-0 items-center gap-1 text-[13px] text-[#3F3D46]">
                  <MapPin className="w-3.5 h-3.5 text-[#DDAA42] flex-shrink-0" />
                  <span className="truncate" title={property.subtitle}>{property.subtitle}</span>
                </div>

                {/* Price */}
                <div className="min-w-0">
                  <p className="break-words text-[14px] font-bold text-[#DDAA42]">{property.price}</p>
                  {property.pricePerSqft && (
                    <p className="text-[11px] text-[#68646F]">{property.pricePerSqft}</p>
                  )}
                </div>

                {/* Source Badge */}
                <div className="min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      property.submittedBy === "user"
                        ? "bg-blue-50 text-blue-600"
                        : isAdmin
                        ? "bg-[#F3F1F5] text-[#DDAA42]"
                        : "bg-[#FFF8E8] text-[#DDAA42]"
                    }`}
                  >
                    {property.submittedBy === "user" ? (
                      <>
                        <UserRound className="w-3 h-3" /> User
                      </>
                    ) : isAdmin ? (
                      "Admin"
                    ) : (
                      "Mock"
                    )}
                  </span>
                  {isAdmin && (property.updatedAt || property.postedDate || property.createdAt) && (
                    <p className="text-[10px] text-[#68646F] mt-0.5">Updated {getTimeAgo(property.updatedAt || property.postedDate || property.createdAt)}</p>
                  )}
                </div>

                {/* Status */}
                <div className="min-w-0">
                  <StatusControls
                    status={property.status || (property.published !== false ? "approved" : "pending")}
                    onChange={(s) => setPropertyStatus(property.id, s).then(onPropertyDeleted)}
                  />
                  {property.status === "recheck" && <div className="mt-1.5 flex flex-wrap gap-1">
                    <button type="button" disabled={workflowBusy === property.id} onClick={() => void handleRecheck(property.id, "move_to_pending")} className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-800 disabled:opacity-50">Mark correct → Pending</button>
                    <button type="button" disabled={workflowBusy === property.id} onClick={() => void handleRecheck(property.id, "publish")} className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 disabled:opacity-50">Publish</button>
                  </div>}
                  {property.featured && (
                    <p className="text-[10px] text-[#DDAA42] font-bold mt-0.5 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#DDAA42]" /> Featured
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex w-full flex-wrap items-center justify-start gap-2 border-t border-[#F3F1F5] pt-3 lg:w-auto lg:flex-nowrap lg:justify-center lg:border-t-0 lg:pt-0 lg:whitespace-nowrap">
                  <Link
                    href={property.status === "recheck" ? `/admin/post?edit=${encodeURIComponent(property.id)}` : `/property/${property.id}`}
                    aria-label={`${property.status === "recheck" ? "Review" : "View"} ${property.title}`}
                    className="inline-flex h-9 min-w-[76px] flex-1 items-center justify-center gap-1 rounded-lg border border-[#E4E0E7]/30 bg-[#F8F7FA] px-2 text-[11px] font-bold text-[#DDAA42] transition-colors hover:bg-[#F3F1F5] lg:h-8 lg:min-w-8 lg:flex-none lg:px-0"
                    title={property.status === "recheck" ? "Open private review form" : "View on site"}
                  >
                    <Eye className="h-4 w-4" /><span className="lg:hidden">View</span>
                  </Link>
                  <Link
                    href={`/admin/post?edit=${encodeURIComponent(property.id)}`}
                    aria-label={`Edit ${property.title}`}
                    className="inline-flex h-9 min-w-[76px] flex-1 items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-100 lg:h-8 lg:min-w-8 lg:flex-none lg:px-0"
                    title="Edit property"
                  >
                    <Pencil className="h-4 w-4" /><span className="lg:hidden">Edit</span>
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleFeature(property.id, !!property.featured)}
                      aria-label={property.featured ? `Unfeature ${property.title}` : `Feature ${property.title}`}
                      className={`inline-flex h-9 min-w-[92px] flex-1 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-bold transition-colors lg:h-8 lg:min-w-8 lg:flex-none lg:px-0 ${
                        property.featured
                          ? "bg-[#FFF8E8] hover:bg-[#FAEBC8] border-[#F2C052]/40"
                          : "bg-[#F8F7FA] hover:bg-[#F3F1F5] border-[#E4E0E7]/30"
                      }`}
                      title={property.featured ? "Remove from featured" : "Mark as featured"}
                    >
                      <Star className={`h-4 w-4 ${property.featured ? "fill-[#DDAA42] text-[#DDAA42]" : "text-[#68646F]"}`} /><span className="lg:hidden">{property.featured ? "Unfeature" : "Feature"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setDeleteError(""); setDeleteModal(property.id); }}
                    aria-label={`Delete ${property.title}`}
                    className="inline-flex h-9 min-w-[82px] flex-1 items-center justify-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 text-[11px] font-bold text-red-500 transition-colors hover:bg-red-100 lg:h-8 lg:min-w-8 lg:flex-none lg:px-0"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" /><span className="lg:hidden">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-[#F8F7FA]/50 border-t border-[#F3F1F5]">
            <p className="text-[12px] text-[#68646F]">
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, filteredProperties.length)} of{" "}
              {filteredProperties.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#68646F] hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#DDAA42] text-[#0B1328]"
                      : "text-[#68646F] hover:bg-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#68646F] hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#121B35]">Delete Property</h3>
                <p className="text-[13px] text-[#68646F]">The project and its stored photos will be permanently deleted.</p>
              </div>
              <button onClick={() => setDeleteModal(null)} className="ml-auto text-[#68646F] hover:text-[#121B35]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium border border-[#E4E0E7]/30 text-[#3F3D46] hover:bg-[#F8F7FA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
            {deleteError && <p role="alert" className="mt-3 text-[12.5px] text-red-700">{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
