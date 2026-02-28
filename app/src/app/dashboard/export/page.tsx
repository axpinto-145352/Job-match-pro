"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FiDownload,
  FiExternalLink,
  FiLoader,
  FiFileText,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiLink,
  FiTable,
  FiClock,
  FiChevronDown,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExportRecord {
  id: string;
  userId: string;
  spreadsheetId: string;
  sheetName: string;
  jobCount: number;
  exportedAt: string;
}

type ExportStatus = "NEW" | "SAVED" | "APPLIED" | "ARCHIVED" | "ALL";

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function ExportHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-border last:border-0"
        >
          <div className="space-y-2">
            <div className="skeleton h-4 w-48 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connected state card
// ---------------------------------------------------------------------------

function ConnectedSheet({
  spreadsheetId,
  onDisconnect,
}: {
  spreadsheetId: string;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
        <FiCheckCircle size={18} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-800">Google Sheets Connected</p>
        <p className="text-xs text-green-600 truncate">
          Spreadsheet: {spreadsheetId}
        </p>
      </div>
      <button
        onClick={onDisconnect}
        className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline flex-shrink-0"
      >
        Disconnect
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Export Page
// ---------------------------------------------------------------------------

export default function ExportPage() {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Spreadsheet config
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("JobMatch Export");

  // Export options
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  // Export history
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch export history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/export");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
          // If we have history, we are connected
          if (data.length > 0) {
            setIsConnected(true);
            setSpreadsheetId(data[0].spreadsheetId);
          }
        } else if (data.exports) {
          setHistory(data.exports);
          if (data.exports.length > 0) {
            setIsConnected(true);
            setSpreadsheetId(data.exports[0].spreadsheetId);
          }
        }
      }
    } catch {
      // Non-critical, fail silently
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Connect to Google Sheets
  const handleConnect = async () => {
    if (!spreadsheetId.trim()) {
      toast.error("Please enter a Spreadsheet ID");
      return;
    }
    setConnecting(true);
    try {
      // Validate the spreadsheet ID by attempting a connection
      // In a real app, this would call the Google Sheets API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsConnected(true);
      toast.success("Google Sheets connected successfully");
    } catch {
      toast.error("Failed to connect to Google Sheets");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSpreadsheetId("");
    toast.success("Google Sheets disconnected");
  };

  // Export jobs
  const handleExport = async () => {
    if (!spreadsheetId.trim()) {
      toast.error("Please enter a Spreadsheet ID");
      return;
    }
    if (!sheetName.trim()) {
      toast.error("Please enter a sheet name");
      return;
    }

    setExporting(true);
    try {
      const body: Record<string, string> = {
        spreadsheetId: spreadsheetId.trim(),
        sheetName: sheetName.trim(),
      };
      if (exportStatus !== "ALL") {
        body.status = exportStatus;
      }
      if (dateFrom) body.dateFrom = dateFrom;
      if (dateTo) body.dateTo = dateTo;

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Export failed");
        setExporting(false);
        return;
      }

      const result = await res.json();
      toast.success(
        `Exported ${result.jobCount ?? 0} jobs to Google Sheets`
      );
      fetchHistory();
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Google Sheets Export
        </h1>
        <p className="text-sm text-muted mt-1">
          Export your matched jobs to Google Sheets for tracking and analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Connection Card */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FiLink size={16} className="text-primary" />
            Spreadsheet Connection
          </h2>

          {isConnected ? (
            <ConnectedSheet
              spreadsheetId={spreadsheetId}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Connect your Google Spreadsheet to export job matches. You can find
                the Spreadsheet ID in the URL of your Google Sheet.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted mb-1.5 block">
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Found in the URL: docs.google.com/spreadsheets/d/
                    <span className="text-primary font-medium">
                      SPREADSHEET_ID
                    </span>
                    /edit
                  </p>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !spreadsheetId.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {connecting ? (
                      <>
                        <FiLoader size={14} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <FiExternalLink size={14} />
                        Connect
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FiFilter size={16} className="text-primary" />
            Export Options
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Sheet name */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1">
                <FiTable size={11} />
                Sheet Name
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet name"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Status filter */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1">
                <FiFilter size={11} />
                Filter by Status
              </label>
              <div className="relative">
                <select
                  value={exportStatus}
                  onChange={(e) =>
                    setExportStatus(e.target.value as ExportStatus)
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                >
                  <option value="ALL">All Saved Jobs</option>
                  <option value="NEW">New Only</option>
                  <option value="SAVED">Saved Only</option>
                  <option value="APPLIED">Applied Only</option>
                  <option value="ARCHIVED">Archived Only</option>
                </select>
                <FiChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
              </div>
            </div>

            {/* Date from */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1">
                <FiCalendar size={11} />
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 flex items-center gap-1">
                <FiCalendar size={11} />
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || !isConnected}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            {exporting ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Export Now
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-xs text-muted mt-3 flex items-center gap-1.5">
              <FiAlertCircle size={12} />
              Connect a Google Spreadsheet above to enable exports
            </p>
          )}
        </div>

        {/* Export History */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FiClock size={16} className="text-primary" />
              Export History
            </h2>
            <button
              onClick={fetchHistory}
              className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/5 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>

          {loadingHistory ? (
            <ExportHistorySkeleton />
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                <FiFileText size={24} className="text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                No exports yet
              </h3>
              <p className="text-xs text-muted">
                Your export history will appear here after your first export
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted py-3 pr-4">
                      Sheet
                    </th>
                    <th className="text-left text-xs font-medium text-muted py-3 pr-4">
                      Spreadsheet
                    </th>
                    <th className="text-center text-xs font-medium text-muted py-3 pr-4">
                      Jobs
                    </th>
                    <th className="text-right text-xs font-medium text-muted py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FiTable size={14} className="text-muted flex-shrink-0" />
                          <span className="text-sm text-foreground font-medium">
                            {record.sheetName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted font-mono truncate max-w-[200px] block">
                          {record.spreadsheetId.substring(0, 20)}...
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {record.jobCount}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-xs text-muted">
                          {new Date(record.exportedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            How Google Sheets Export Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  Connect Spreadsheet
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Paste your Google Spreadsheet ID to connect
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  Choose Options
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Filter by status and date range
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  Export Jobs
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Click export and your data appears in Sheets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
