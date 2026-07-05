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
  CheckCircle2,
  CircleOff,
  UserRound,
} from "lucide-react";
import { deleteProperty, togglePublish, toggleFeatured, setPropertyStatus } from "@/lib/propertyStore";
import StatusControls from "@/components/admin/StatusControls";
import type { Property } from "@/components/acres/mock-data";

interface PropertyTableProps {
  properties: Property[];
  adminProperties: Property[];
  onPropertyDeleted: () => void;
}

export default function PropertyTable({
  properties,
  adminProperties,
  onPropertyDeleted,
}: PropertyTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "admin" | "mock">("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
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

  const adminIds = new Set(adminProperties.map((p) => p.id));

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.builder?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && (p.status ? p.status !== "approved" : p.published === false)) ||
      (filter === "admin" && adminIds.has(p.id)) ||
      (filter === "mock" && !adminIds.has(p.id));
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredProperties.length / perPage);
  const paged = filteredProperties.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDelete = async (id: string) => {
    await deleteProperty(id);
    setDeleteModal(null);
    onPropertyDeleted();
  };

  const handlePublish = async (id: string, currentState: boolean) => {
    await togglePublish(id, currentState);
    onPropertyDeleted();
  };

  const handleFeature = async (id: string, currentState: boolean) => {
    await toggleFeatured(id, currentState);
    onPropertyDeleted();
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr || !now) return "—";
    const diff = now - new Date(dateStr).getTime();
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
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#D5DEF2]/30 focus-within:border-[#C9A24E]/40 focus-within:ring-2 focus-within:ring-[#C9A24E]/10 transition-all">
          <Search className="w-4 h-4 text-[#6E7488]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, location, builder..."
            className="flex-1 bg-transparent text-[14px] text-[#1E3A8A] placeholder-[#6E7488] outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "admin", "mock"] as const).map((f) => {
            const pendingCount = properties.filter((p) => (p.status ? p.status !== "approved" : p.published === false)).length;
            const label =
              f === "all" ? "All" : f === "pending" ? "Pending" : f === "admin" ? "Admin Posted" : "Mock Data";
            return (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                    : f === "pending" && pendingCount > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300"
                    : "bg-white text-[#6E7488] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                }`}
              >
                {label}
                {f === "pending" && pendingCount > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/25" : "bg-amber-500 text-white"}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_130px_110px_110px_150px] gap-4 px-6 py-3 bg-[#F1F5FF] border-b border-[#E2E9FB] text-[11px] font-bold text-[#6E7488] uppercase tracking-wider">
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
            <Building2 className="w-12 h-12 text-[#D5DEF2] mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-[#6E7488]">No properties found</p>
            <p className="text-[13px] text-[#6E7488]/70 mt-1">
              {searchQuery ? "Try adjusting your search" : "Post your first property"}
            </p>
          </div>
        ) : (
          paged.map((property) => {
            const isAdmin = adminIds.has(property.id);
            return (
              <div
                key={property.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_130px_110px_110px_150px] gap-3 md:gap-4 px-4 md:px-6 py-4 border-b border-[#E2E9FB]/50 hover:bg-[#F1F5FF]/50 transition-colors items-center"
              >
                {/* Property Name + Thumbnail */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#E2E9FB] border border-[#D5DEF2]/30">
                    {property.images?.[0] || property.image ? (
                      <img
                        src={property.images?.[0] || property.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#D5DEF2]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#1E3A8A] truncate">{property.title}</p>
                    {property.configs.length > 0 && (
                      <p className="text-[11px] text-[#6E7488] truncate">{property.configs.join(", ")}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-[13px] text-[#243559]">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A24E] flex-shrink-0" />
                  <span className="truncate">{property.subtitle}</span>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[14px] font-bold text-[#C9A24E]">{property.price}</p>
                  {property.pricePerSqft && (
                    <p className="text-[11px] text-[#6E7488]">{property.pricePerSqft}</p>
                  )}
                </div>

                {/* Source Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      property.submittedBy === "user"
                        ? "bg-blue-50 text-blue-600"
                        : isAdmin
                        ? "bg-[#E2E9FB] text-[#C9A24E]"
                        : "bg-[#FAF3E2] text-[#D4AF37]"
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
                  {isAdmin && property.postedDate && (
                    <p className="text-[10px] text-[#6E7488] mt-0.5">{getTimeAgo(property.postedDate)}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusControls
                    status={property.status || (property.published !== false ? "approved" : "pending")}
                    onChange={(s) => setPropertyStatus(property.id, s).then(onPropertyDeleted)}
                  />
                  {property.featured && (
                    <p className="text-[10px] text-[#C9A24E] font-bold mt-0.5 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#C9A24E]" /> Featured
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-1.5">
                  <Link
                    href={`/property/${property.id}`}
                    className="w-8 h-8 rounded-lg bg-[#F1F5FF] flex items-center justify-center hover:bg-[#E2E9FB] transition-colors border border-[#D5DEF2]/30"
                    title="View on site"
                  >
                    <Eye className="w-4 h-4 text-[#C9A24E]" />
                  </Link>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleFeature(property.id, !!property.featured)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
                          property.featured
                            ? "bg-[#FAF3E2] hover:bg-[#F5EACC] border-[#E8C66A]/40"
                            : "bg-[#F1F5FF] hover:bg-[#E2E9FB] border-[#D5DEF2]/30"
                        }`}
                        title={property.featured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Star className={`w-4 h-4 ${property.featured ? "fill-[#C9A24E] text-[#C9A24E]" : "text-[#6E7488]"}`} />
                      </button>
                      <button
                        onClick={() => setDeleteModal(property.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors border border-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-[#F1F5FF]/50 border-t border-[#E2E9FB]">
            <p className="text-[12px] text-[#6E7488]">
              Showing {(currentPage - 1) * perPage + 1}–
              {Math.min(currentPage * perPage, filteredProperties.length)} of{" "}
              {filteredProperties.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E7488] hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#C9A24E] text-white"
                      : "text-[#6E7488] hover:bg-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E7488] hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
                <h3 className="text-[16px] font-bold text-[#1E3A8A]">Delete Property</h3>
                <p className="text-[13px] text-[#6E7488]">This action cannot be undone</p>
              </div>
              <button onClick={() => setDeleteModal(null)} className="ml-auto text-[#6E7488] hover:text-[#1E3A8A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium border border-[#D5DEF2]/30 text-[#243559] hover:bg-[#F1F5FF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
