import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import {
  Shield, LogOut, Plus, Trash2, Save, Users, Gift, BarChart3,
  Copy, Check, KeyRound, RefreshCw, ArrowLeft, User, UserPlus,
  Filter, Image, Settings, Lock
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { username, password });
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_role", res.data.role);
      onLogin(res.data.token, res.data.role);
      toast.success("Welcome, Dragon Master!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a0a0a] dragon-pattern" data-testid="admin-login-page">
      <motion.div
        className="dragon-card ornate-corners p-8 md:p-12 max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-[#D4A030]" />
          <h2 className="text-3xl md:text-4xl font-bold font-['Cinzel'] gold-text">
            Admin Panel
          </h2>
          <p className="text-sm font-semibold text-[#D4A030]/40 uppercase tracking-[0.2em] mt-3">
            Enter credentials to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4A030]" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="dragon-input w-full pl-12"
              data-testid="admin-username-input"
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4A030]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="dragon-input w-full pl-12"
              data-testid="admin-password-input"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading || !username || !password}
            className="dragon-btn fire-glow w-full py-4 px-8 text-lg bg-gradient-to-r from-[#9B1B30] to-[#7A1526] text-[#FFD700] disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="admin-login-button"
          >
            {loading ? "Entering..." : "Enter the Lair"}
          </motion.button>
        </form>

        <a
          href="/"
          className="block text-center mt-6 text-sm font-bold text-[#D4A030]/50 hover:text-[#FFD700] transition-colors font-['Cinzel'] tracking-wider"
          data-testid="back-to-main"
        >
          <ArrowLeft className="inline w-4 h-4 mr-1" />
          Back to Wheel
        </a>
      </motion.div>
    </div>
  );
}

function CodesTab({ token }) {
  const [codes, setCodes] = useState([]);
  const [usernamesText, setUsernamesText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [filter, setFilter] = useState("all");

  const headers = { Authorization: `Bearer ${token}` };

  const fetchCodes = useCallback(async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await axios.get(`${API}/admin/codes${params}`, { headers });
      setCodes(res.data.codes || []);
    } catch (err) {
      toast.error("Failed to fetch codes");
    }
  }, [token, filter]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleGenerate = async () => {
    const usernames = usernamesText.split("\n").map(u => u.trim()).filter(Boolean);
    if (usernames.length === 0) {
      toast.error("Enter at least one username");
      return;
    }
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/admin/generate-codes`, { usernames }, { headers });
      toast.success(res.data.message);
      setUsernamesText("");
      fetchCodes();
    } catch (err) {
      toast.error("Failed to generate codes");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(`${code.username} | ${code.redeem_code}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const usedCount = codes.filter(c => c.is_used).length;
  const unusedCount = codes.filter(c => !c.is_used).length;

  return (
    <div className="space-y-6" data-testid="codes-tab">
      <div className="dragon-card p-6">
        <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-4">Generate New Codes</h4>
        <p className="text-sm text-[#D4A030]/40 mb-3">Enter usernames (one per line)</p>
        <div className="flex flex-col gap-3">
          <textarea
            value={usernamesText}
            onChange={(e) => setUsernamesText(e.target.value)}
            placeholder={"john_doe\njane_smith\ndragon_player"}
            className="dragon-input w-full min-h-[100px] resize-y"
            data-testid="usernames-textarea"
          />
          <motion.button
            onClick={handleGenerate}
            disabled={generating || !usernamesText.trim()}
            className="dragon-btn bg-gradient-to-r from-[#D4A030] to-[#B8860B] text-[#1a0a0a] px-6 py-3 flex items-center justify-center gap-2 self-end"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="generate-codes-button"
          >
            <Plus className="w-5 h-5" />
            {generating ? "Forging..." : "Generate Codes"}
          </motion.button>
        </div>
      </div>

      <div className="dragon-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-xl font-bold font-['Cinzel'] gold-text">
            All Codes ({codes.length})
          </h4>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#D4A030]/50" />
            {[
              { key: "all", label: "All" },
              { key: "unused", label: `Active (${filter === "all" ? unusedCount : filter === "unused" ? codes.length : "..."})` },
              { key: "used", label: `Used (${filter === "all" ? usedCount : filter === "used" ? codes.length : "..."})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg font-['Cinzel'] tracking-wider transition-all ${
                  filter === f.key
                    ? "bg-[#D4A030]/20 text-[#FFD700] border border-[#D4A030]/40"
                    : "text-[#D4A030]/40 border border-transparent hover:text-[#D4A030]/70"
                }`}
                data-testid={`filter-${f.key}`}
              >
                {f.label}
              </button>
            ))}
            <motion.button
              onClick={fetchCodes}
              className="p-2 rounded-full hover:bg-[#D4A030]/10 transition-colors ml-1"
              whileHover={{ rotate: 180 }}
              data-testid="refresh-codes-button"
            >
              <RefreshCw className="w-4 h-4 text-[#D4A030]" />
            </motion.button>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {codes.map((code, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                code.is_used
                  ? "bg-[#9B1B30]/10 border-[#9B1B30]/25"
                  : "bg-[#D4A030]/5 border-[#D4A030]/20"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              data-testid={`code-item-${i}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#FFF8E7] truncate font-['Cinzel'] text-sm">{code.username}</p>
                <p className="text-sm font-mono text-[#D4A030]/50">{code.redeem_code}</p>
              </div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-lg font-['Cinzel'] tracking-wider ${
                code.is_used
                  ? "bg-[#9B1B30]/30 text-[#FF6B6B] border border-[#9B1B30]/40"
                  : "bg-[#D4A030]/15 text-[#FFD700] border border-[#D4A030]/30"
              }`}>
                {code.is_used ? "Used" : "Active"}
              </span>
              <button
                onClick={() => copyCode(code, i)}
                className="p-2 rounded-full hover:bg-[#D4A030]/10 transition-colors"
                data-testid={`copy-code-${i}`}
              >
                {copiedIdx === i ? <Check className="w-4 h-4 text-[#FFD700]" /> : <Copy className="w-4 h-4 text-[#D4A030]/50" />}
              </button>
            </motion.div>
          ))}
          {codes.length === 0 && (
            <p className="text-center text-[#D4A030]/30 py-8 font-medium">
              {filter !== "all" ? `No ${filter} codes` : "No codes forged yet"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PrizesTab({ token }) {
  const [prizes, setPrizes] = useState([]);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/prizes`, { headers });
      setPrizes(res.data.prizes || []);
    } catch (err) {
      toast.error("Failed to fetch prizes");
    }
  }, [token]);

  useEffect(() => { fetchPrizes(); }, [fetchPrizes]);

  const COLORS = ["#9B1B30", "#D4A030", "#7A1526", "#B8860B", "#8B0000", "#DAA520", "#5C0A1A", "#C5943A"];

  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const addPrize = () => {
    setPrizes([...prizes, {
      label: "New Prize",
      image_url: "",
      color: COLORS[prizes.length % COLORS.length],
      probability: 50,
    }]);
  };

  const removePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const savePrizes = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/prizes`, { prizes }, { headers });
      toast.success("Prize pool updated!");
      fetchPrizes();
    } catch (err) {
      toast.error("Failed to update prizes");
    } finally {
      setSaving(false);
    }
  };

  const getProbabilityLabel = (prob) => {
    if (prob === 0) return "Never";
    if (prob <= 5) return "Ultra Rare";
    if (prob <= 15) return "Rare";
    if (prob <= 30) return "Uncommon";
    if (prob <= 60) return "Common";
    if (prob <= 90) return "Frequent";
    return "Almost Always";
  };

  const getProbabilityColor = (prob) => {
    if (prob === 0) return "#666";
    if (prob <= 5) return "#FF4444";
    if (prob <= 15) return "#FF8C00";
    if (prob <= 30) return "#FFD700";
    if (prob <= 60) return "#DAA520";
    if (prob <= 90) return "#10B981";
    return "#06B6D4";
  };

  return (
    <div className="space-y-6" data-testid="prizes-tab">
      {/* Probability Legend */}
      <div className="dragon-card p-6">
        <h4 className="text-lg font-bold font-['Cinzel'] gold-text mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#FFD700]" />
          Probability Guide
        </h4>
        <p className="text-xs text-[#D4A030]/40 mb-3">0 = never drops, 100 = always drops. Values are relative weights.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Never (0)", color: "#666" },
            { label: "Ultra Rare (1-5)", color: "#FF4444" },
            { label: "Rare (6-15)", color: "#FF8C00" },
            { label: "Uncommon (16-30)", color: "#FFD700" },
            { label: "Common (31-60)", color: "#DAA520" },
            { label: "Frequent (61-90)", color: "#10B981" },
            { label: "Almost Always (91-100)", color: "#06B6D4" },
          ].map((item, i) => (
            <span key={i} className="text-xs font-bold px-2 py-1 rounded-lg border" style={{ color: item.color, borderColor: item.color + "40" }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="dragon-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold font-['Cinzel'] gold-text">
            Prize Pool ({prizes.length} segments)
          </h4>
          <div className="flex gap-2">
            <motion.button
              onClick={addPrize}
              className="dragon-btn bg-[#D4A030]/15 text-[#FFD700] px-4 py-2 text-sm flex items-center gap-1"
              whileHover={{ scale: 1.02 }}
              data-testid="add-prize-button"
            >
              <Plus className="w-4 h-4" /> Add
            </motion.button>
            <motion.button
              onClick={savePrizes}
              disabled={saving}
              className="dragon-btn bg-gradient-to-r from-[#D4A030] to-[#B8860B] text-[#1a0a0a] px-4 py-2 text-sm flex items-center gap-1"
              whileHover={{ scale: 1.02 }}
              data-testid="save-prizes-button"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </motion.button>
          </div>
        </div>

        <div className="space-y-4">
          {prizes.map((prize, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-xl border border-[#D4A030]/15 bg-[#1a0a0a]/40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              data-testid={`prize-item-${i}`}
            >
              {/* Row 1: Color, Label, Image, Delete */}
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={prize.color}
                  onChange={(e) => updatePrize(i, "color", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#D4A030]/30 cursor-pointer bg-transparent shrink-0"
                  data-testid={`prize-color-${i}`}
                />
                <input
                  type="text"
                  value={prize.label}
                  onChange={(e) => updatePrize(i, "label", e.target.value)}
                  className="dragon-input flex-1"
                  placeholder="Prize Name"
                  data-testid={`prize-label-${i}`}
                />
                {prize.image_url && (
                  <img src={prize.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#D4A030]/30" />
                )}
                <motion.button
                  onClick={() => removePrize(i)}
                  className="p-2 rounded-full hover:bg-[#9B1B30]/20 transition-colors shrink-0"
                  whileHover={{ scale: 1.1 }}
                  data-testid={`remove-prize-${i}`}
                >
                  <Trash2 className="w-5 h-5 text-[#9B1B30]" />
                </motion.button>
              </div>

              {/* Row 2: Image URL */}
              <div className="flex items-center gap-2 mb-3">
                <Image className="w-4 h-4 text-[#D4A030]/40 shrink-0" />
                <input
                  type="text"
                  value={prize.image_url || ""}
                  onChange={(e) => updatePrize(i, "image_url", e.target.value)}
                  className="dragon-input flex-1 text-sm"
                  placeholder="Image URL (optional)"
                  data-testid={`prize-image-${i}`}
                />
              </div>

              {/* Row 3: Probability Slider */}
              <div className="flex items-center gap-3" data-testid={`prize-prob-row-${i}`}>
                <span className="text-xs font-bold text-[#D4A030]/50 uppercase tracking-wider font-['Cinzel'] w-20 shrink-0">
                  Probability
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(prize.probability) || 0}
                  onChange={(e) => updatePrize(i, "probability", parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${prize.color || '#D4A030'} 0%, ${prize.color || '#D4A030'} ${Math.round(prize.probability)}%, rgba(212,160,48,0.15) ${Math.round(prize.probability)}%, rgba(212,160,48,0.15) 100%)`
                  }}
                  data-testid={`prize-prob-slider-${i}`}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(prize.probability)}
                    onChange={(e) => updatePrize(i, "probability", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="dragon-input w-16 text-center text-sm py-1"
                    data-testid={`prize-prob-input-${i}`}
                  />
                  <span className="text-xs font-bold font-['Cinzel'] w-24 text-right" style={{ color: getProbabilityColor(prize.probability) }}>
                    {getProbabilityLabel(prize.probability)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsTab({ token }) {
  const [stats, setStats] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch stats");
    }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!stats) return <div className="text-center py-12 text-[#D4A030]/40 font-['Cinzel']">Loading statistics...</div>;

  return (
    <div className="space-y-6" data-testid="stats-tab">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Codes", value: stats.total_codes, color: "#D4A030", icon: Users },
          { label: "Used", value: stats.used_codes, color: "#9B1B30", icon: Check },
          { label: "Available", value: stats.unused_codes, color: "#DAA520", icon: Gift },
          { label: "Total Draws", value: stats.total_draws, color: "#FFD700", icon: BarChart3 },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="dragon-card p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            data-testid={`stat-card-${i}`}
          >
            <s.icon className="w-8 h-8 mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-3xl font-bold font-['Cinzel']" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#D4A030]/40 mt-1 font-['Cinzel']">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {stats.prize_distribution && stats.prize_distribution.length > 0 && (
        <div className="dragon-card p-6">
          <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-4">Prize Distribution</h4>
          <div className="space-y-3">
            {stats.prize_distribution.map((pd, i) => (
              <div key={i} className="flex items-center gap-4" data-testid={`distribution-item-${i}`}>
                <span className="font-bold text-[#FFF8E7] w-32 truncate text-sm font-['Cinzel']">{pd._id}</span>
                <div className="flex-1 h-6 bg-[#1a0a0a] rounded-lg overflow-hidden border border-[#D4A030]/15">
                  <motion.div
                    className="h-full rounded-lg bg-gradient-to-r from-[#9B1B30] to-[#D4A030]"
                    style={{ width: `${Math.max(5, (pd.count / stats.total_draws) * 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, (pd.count / stats.total_draws) * 100)}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
                <span className="font-bold text-[#FFD700] w-12 text-right text-sm">{pd.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dragon-card p-6">
        <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-4">
          Draw History ({stats.history?.length || 0})
        </h4>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left" data-testid="history-table">
            <thead className="sticky top-0 bg-[#2a0e0e]">
              <tr className="border-b border-[#D4A030]/30">
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-[0.15em] text-[#D4A030]/50 font-['Cinzel']">User</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-[0.15em] text-[#D4A030]/50 font-['Cinzel']">Prize</th>
                <th className="py-3 px-4 font-bold text-xs uppercase tracking-[0.15em] text-[#D4A030]/50 font-['Cinzel']">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats.history || []).map((h, i) => (
                <tr key={i} className="border-b border-[#D4A030]/10 hover:bg-[#D4A030]/5 transition-colors" data-testid={`history-row-${i}`}>
                  <td className="py-3 px-4 font-bold text-[#FFF8E7] text-sm">{h.username}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-lg text-[#FFD700] text-sm font-bold border border-[#D4A030]/30 bg-[#9B1B30]/20">
                      {h.prize_label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#D4A030]/40">{new Date(h.drawn_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats.history || stats.history.length === 0) && (
            <p className="text-center text-[#D4A030]/30 py-8 font-medium">No draws yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminsTab({ token }) {
  const [admins, setAdmins] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/admins`, { headers });
      setAdmins(res.data.admins || []);
    } catch (err) {
      toast.error("Failed to fetch admins");
    }
  }, [token]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username and password required");
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API}/admin/create-admin`, {
        username: newUsername.trim(),
        password: newPassword.trim()
      }, { headers });
      toast.success(`Admin '${newUsername}' created!`);
      setNewUsername("");
      setNewPassword("");
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (username) => {
    try {
      await axios.delete(`${API}/admin/admins/${username}`, { headers });
      toast.success(`Admin '${username}' removed`);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete admin");
    }
  };

  return (
    <div className="space-y-6" data-testid="admins-tab">
      <div className="dragon-card p-6">
        <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#FFD700]" />
          Create Admin Account
        </h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username"
            className="dragon-input flex-1"
            data-testid="new-admin-username"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password"
            className="dragon-input flex-1"
            data-testid="new-admin-password"
          />
          <motion.button
            onClick={handleCreate}
            disabled={creating}
            className="dragon-btn bg-gradient-to-r from-[#D4A030] to-[#B8860B] text-[#1a0a0a] px-6 py-3 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            data-testid="create-admin-button"
          >
            <UserPlus className="w-5 h-5" />
            {creating ? "Creating..." : "Create"}
          </motion.button>
        </div>
      </div>

      <div className="dragon-card p-6">
        <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-4">
          Admin Accounts ({admins.length})
        </h4>
        <div className="space-y-2">
          {admins.map((admin, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-[#D4A030]/15 bg-[#1a0a0a]/40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-testid={`admin-item-${i}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D4A030]/15 border border-[#D4A030]/30">
                <Shield className="w-5 h-5 text-[#D4A030]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#FFF8E7] font-['Cinzel'] text-sm">{admin.username}</p>
                <p className="text-xs text-[#D4A030]/40">{admin.role === "master" ? "Master Admin" : "Admin"}</p>
              </div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-lg font-['Cinzel'] tracking-wider ${
                admin.role === "master"
                  ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                  : "bg-[#D4A030]/10 text-[#D4A030] border border-[#D4A030]/20"
              }`}>
                {admin.role}
              </span>
              {admin.role !== "master" && (
                <motion.button
                  onClick={() => handleDelete(admin.username)}
                  className="p-2 rounded-full hover:bg-[#9B1B30]/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  data-testid={`delete-admin-${i}`}
                >
                  <Trash2 className="w-4 h-4 text-[#9B1B30]" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


function SettingsTab({ token }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, { headers });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="settings-tab">
      <div className="dragon-card p-6 max-w-lg">
        <h4 className="text-xl font-bold font-['Cinzel'] gold-text mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#FFD700]" />
          Change Password
        </h4>
        <p className="text-sm text-[#D4A030]/40 mb-6">Update your admin account password</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#D4A030]/50 uppercase tracking-wider font-['Cinzel'] mb-1 block">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="dragon-input w-full"
              data-testid="current-password-input"
            />
          </div>

          <div className="ornate-divider my-2" />

          <div>
            <label className="text-xs font-bold text-[#D4A030]/50 uppercase tracking-wider font-['Cinzel'] mb-1 block">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="dragon-input w-full"
              data-testid="new-password-input"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#D4A030]/50 uppercase tracking-wider font-['Cinzel'] mb-1 block">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="dragon-input w-full"
              data-testid="confirm-password-input"
            />
          </div>

          <motion.button
            onClick={handleChangePassword}
            disabled={changing || !currentPassword || !newPassword || !confirmPassword}
            className="dragon-btn bg-gradient-to-r from-[#D4A030] to-[#B8860B] text-[#1a0a0a] px-6 py-3 w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="change-password-button"
          >
            <Lock className="w-5 h-5" />
            {changing ? "Changing..." : "Change Password"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [role, setRole] = useState(localStorage.getItem("admin_role") || "");
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/admin/codes`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => setIsAuth(true))
        .catch(() => {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_role");
          setToken("");
          setRole("");
          setIsAuth(false);
        });
    }
  }, [token]);

  const handleLogin = (t, r) => {
    setToken(t);
    setRole(r);
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    setToken("");
    setRole("");
    setIsAuth(false);
    toast.success("Logged out");
  };

  if (!isAuth) return <AdminLogin onLogin={handleLogin} />;

  const isMaster = role === "master";

  return (
    <div className="min-h-screen bg-[#1a0a0a] dragon-pattern" data-testid="admin-dashboard">
      <motion.header
        className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-[#D4A030]/15"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#D4A030]" />
          <h1 className="text-2xl md:text-3xl font-bold font-['Cinzel'] gold-text">
            Dragon's Lair
          </h1>
          {isMaster && (
            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 font-['Cinzel']">
              Master
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm font-bold text-[#D4A030]/50 hover:text-[#FFD700] transition-colors font-['Cinzel'] tracking-wider"
            data-testid="admin-back-to-main"
          >
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Back
          </a>
          <motion.button
            onClick={handleLogout}
            className="dragon-btn bg-[#9B1B30]/30 text-[#FF6B6B] px-4 py-2 text-sm flex items-center gap-1"
            whileHover={{ scale: 1.02 }}
            data-testid="admin-logout-button"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>
      </motion.header>

      <main className="px-6 md:px-12 pb-12 pt-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="codes" className="admin-tabs">
            <TabsList className="w-full flex bg-[#2a0e0e] border border-[#D4A030]/25 rounded-xl p-1 mb-8 shadow-[0_0_20px_rgba(212,160,48,0.08)]">
              <TabsTrigger value="codes" className="flex-1 rounded-lg py-3 font-bold font-['Cinzel'] text-sm tracking-wider transition-all text-[#D4A030]/60 data-[state=active]:text-[#FFD700]" data-testid="tab-codes">
                <Users className="w-4 h-4 mr-2 inline" />Codes
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex-1 rounded-lg py-3 font-bold font-['Cinzel'] text-sm tracking-wider transition-all text-[#D4A030]/60 data-[state=active]:text-[#FFD700]" data-testid="tab-prizes">
                <Gift className="w-4 h-4 mr-2 inline" />Prizes
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1 rounded-lg py-3 font-bold font-['Cinzel'] text-sm tracking-wider transition-all text-[#D4A030]/60 data-[state=active]:text-[#FFD700]" data-testid="tab-stats">
                <BarChart3 className="w-4 h-4 mr-2 inline" />Stats
              </TabsTrigger>
              {isMaster && (
                <TabsTrigger value="admins" className="flex-1 rounded-lg py-3 font-bold font-['Cinzel'] text-sm tracking-wider transition-all text-[#D4A030]/60 data-[state=active]:text-[#FFD700]" data-testid="tab-admins">
                  <Shield className="w-4 h-4 mr-2 inline" />Admins
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="flex-1 rounded-lg py-3 font-bold font-['Cinzel'] text-sm tracking-wider transition-all text-[#D4A030]/60 data-[state=active]:text-[#FFD700]" data-testid="tab-settings">
                <Settings className="w-4 h-4 mr-2 inline" />Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="codes"><CodesTab token={token} /></TabsContent>
            <TabsContent value="prizes"><PrizesTab token={token} /></TabsContent>
            <TabsContent value="stats"><StatsTab token={token} /></TabsContent>
            {isMaster && <TabsContent value="admins"><AdminsTab token={token} /></TabsContent>}
            <TabsContent value="settings"><SettingsTab token={token} /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
