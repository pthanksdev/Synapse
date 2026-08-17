import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import {
  ShieldAlertIcon,
  UsersIcon,
  MessageSquareIcon,
  ArrowLeftIcon,
  FilmIcon,
  ActivityIcon,
  RefreshCwIcon,
  PieChartIcon,
  PaletteIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

import { AdminOverviewTab } from "../components/admin/AdminOverviewTab";
import { AdminTelemetryTab } from "../components/admin/AdminTelemetryTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminMessagesTab } from "../components/admin/AdminMessagesTab";
import { AdminGroupsTab } from "../components/admin/AdminGroupsTab";
import { AdminStoriesTab } from "../components/admin/AdminStoriesTab";
import { AdminReportsTab } from "../components/admin/AdminReportsTab";
import { AdminWallpapersTab } from "../components/admin/AdminWallpapersTab";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalGroups: 0,
    totalStories: 0,
    activeReports: 0,
    suspendedUsers: 0,
  });

  const [telemetry, setTelemetry] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stories, setStories] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchMsg, setSearchMsg] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTelemetry = async () => {
    try {
      const res = await axiosInstance.get("/admin/telemetry");
      setTelemetry(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/admin/messages?search=${encodeURIComponent(searchMsg)}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/admin/groups");
      setGroups(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await axiosInstance.get("/admin/stories");
      setStories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get("/admin/reports");
      setReports(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axiosInstance.get("/admin/audit-logs");
      setLogs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchTelemetry(),
      fetchUsers(),
      fetchMessages(),
      fetchGroups(),
      fetchStories(),
      fetchReports(),
      fetchLogs(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleToggleSuspend = async (userId) => {
    try {
      const res = await axiosInstance.post(`/admin/users/${userId}/suspend`);
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to update user suspension status");
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const res = await axiosInstance.patch(`/admin/users/${userId}/role`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axiosInstance.delete(`/admin/messages/${msgId}`);
      toast.success("Message force deleted");
      fetchMessages();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleDisbandGroup = async (groupId) => {
    if (!confirm("Disband this group permanently?")) return;
    try {
      await axiosInstance.delete(`/admin/groups/${groupId}`);
      toast.success("Group disbanded");
      fetchGroups();
      fetchStats();
    } catch (error) {
      toast.error("Failed to disband group");
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await axiosInstance.delete(`/admin/stories/${storyId}`);
      toast.success("Story removed");
      fetchStories();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axiosInstance.post(`/admin/reports/${reportId}/resolve`);
      toast.success("Report resolved");
      fetchReports();
      fetchStats();
    } catch (error) {
      toast.error("Failed to resolve report");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ShieldAlertIcon className="size-6 text-red-500" /> Master Owner Control Center
              </h1>
              <p className="text-xs text-muted">
                Modular oversight: users, usage telemetry, group rosters & security audit trail.
                </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/chat")} className="gap-1.5 text-xs">
              <MessageSquareIcon className="size-4 text-accent" /> Switch to User Chat View
            </Button>
            <Button variant="secondary" size="sm" onClick={fetchAllData}>
              <RefreshCwIcon className="size-4 mr-1.5" /> Refresh Telemetry
            </Button>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-8 bg-surface/60 p-1">
            <TabsTrigger value="overview" className="gap-1 text-xs">
              <ActivityIcon className="size-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="gap-1 text-xs text-accent">
              <PieChartIcon className="size-3.5" /> Telemetry
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs">
              <UsersIcon className="size-3.5" /> Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs">
              <MessageSquareIcon className="size-3.5" /> Messages
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs">
              <UsersIcon className="size-3.5" /> Groups ({groups.length})
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1 text-xs">
              <FilmIcon className="size-3.5" /> Stories ({stories.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 text-xs text-red-400">
              <ShieldAlertIcon className="size-3.5" /> Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="wallpapers" className="gap-1 text-xs text-purple-400">
              <PaletteIcon className="size-3.5" /> Themes & Wallpapers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverviewTab stats={stats} logs={logs} />
          </TabsContent>

          <TabsContent value="telemetry">
            <AdminTelemetryTab telemetry={telemetry} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab
              users={users}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              handleToggleRole={handleToggleRole}
              handleToggleSuspend={handleToggleSuspend}
              handleDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessagesTab
              messages={messages}
              searchMsg={searchMsg}
              setSearchMsg={setSearchMsg}
              fetchMessages={fetchMessages}
              handleDeleteMessage={handleDeleteMessage}
            />
          </TabsContent>

          <TabsContent value="groups">
            <AdminGroupsTab groups={groups} handleDisbandGroup={handleDisbandGroup} />
          </TabsContent>

          <TabsContent value="stories">
            <AdminStoriesTab stories={stories} handleDeleteStory={handleDeleteStory} />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportsTab
              reports={reports}
              handleToggleSuspend={handleToggleSuspend}
              handleResolveReport={handleResolveReport}
            />
          </TabsContent>

          <TabsContent value="wallpapers">
            <AdminWallpapersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
