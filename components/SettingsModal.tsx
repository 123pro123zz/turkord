import { X, User, Shield, Volume2, Monitor, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  setUsername: (u: string) => void;
  avatarUrl: string;
  setAvatarUrl: (u: string) => void;
  theme: string;
  setTheme: (t: string) => void;
}

export default function SettingsModal({ isOpen, onClose, username, setUsername, avatarUrl, setAvatarUrl, theme, setTheme }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("My Account");
  const [tempUsername, setTempUsername] = useState(username);
  const [tempAvatar, setTempAvatar] = useState(avatarUrl);

  // Keep local copies in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempUsername(username);
      setTempAvatar(avatarUrl);
    }
  }, [isOpen, username, avatarUrl]);

  if (!isOpen) return null;

  const tabs = [
    { name: "My Account", icon: User },
    { name: "Privacy & Safety", icon: Shield },
    { name: "Voice & Video", icon: Volume2 },
    { name: "Appearance", icon: Monitor },
    { name: "Notifications", icon: Bell },
  ];

  const handleSave = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      localStorage.setItem("turkord_username", tempUsername.trim());
    }
    setAvatarUrl(tempAvatar.trim());
    localStorage.setItem("turkord_avatar", tempAvatar.trim());
    onClose();
  };

  const themes = [
    { id: "theme-light", name: "Apple Light" },
    { id: "theme-dark", name: "Apple Dark" },
    { id: "theme-dracula", name: "Dracula Mode" },
    { id: "theme-midnight", name: "Deep Midnight" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-8">
      <div className="flex h-[80vh] w-[900px] max-w-full overflow-hidden rounded-[20px] bg-background shadow-2xl animate-in zoom-in-95 duration-200 border border-borderMain">
        
        {/* Settings Sidebar */}
        <div className="w-[280px] bg-sidebar py-8 pl-6 pr-4 flex flex-col border-r border-borderMain shrink-0">
          <div className="mb-2 px-3 text-xs font-semibold text-textMuted uppercase tracking-wider">User Settings</div>
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-3 rounded-apple px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'bg-background shadow-sm text-accent font-semibold' : 'text-textMuted hover:bg-sidebarHover hover:text-textMain'}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-background relative flex flex-col">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-sidebar text-textMuted hover:bg-borderMain hover:text-textMain transition-colors z-10"
          >
            <X size={18} strokeWidth={2} />
          </button>

          <div className="flex-1 overflow-y-auto p-10 mt-2">
            <h2 className="mb-6 text-2xl font-semibold text-textMain tracking-tight">{activeTab}</h2>
            
            {activeTab === "My Account" && (
              <div className="flex flex-col gap-8 flex-1">
                <div className="rounded-[16px] border border-borderMain p-6">
                  <div className="mb-4 text-xs font-semibold text-textMuted uppercase tracking-wider">Profile Information</div>
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-3xl font-semibold text-white shadow-sm shrink-0 overflow-hidden">
                      {tempAvatar ? <img src={tempAvatar} alt="" className="object-cover w-full h-full" /> : tempUsername?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">Display Name</label>
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="w-full rounded-apple border border-borderMain bg-sidebar px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all text-textMain font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">Avatar Image URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://example.com/avatar.png"
                          value={tempAvatar}
                          onChange={(e) => setTempAvatar(e.target.value)}
                          className="w-full rounded-apple border border-borderMain bg-sidebar px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all text-textMain font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Voice & Video" && (
              <div className="flex flex-col gap-6">
                <div className="rounded-[16px] bg-sidebar p-6 border border-borderMain">
                  <h3 className="text-sm font-medium text-textMain mb-1">Voice Processing</h3>
                  <p className="text-[13px] text-textMuted mb-6">Input and output device selection is automatically handled by LiveKit SDK and your browser permissions.</p>
                  
                  <div className="flex items-center justify-between py-4 border-t border-borderMain">
                    <span className="text-sm font-medium text-textMain">Echo Cancellation</span>
                    <div className="w-11 h-6 bg-[#34C759] rounded-full relative shadow-inner cursor-pointer transition-colors">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-borderMain">
                    <span className="text-sm font-medium text-textMain">Noise Suppression</span>
                    <div className="w-11 h-6 bg-[#34C759] rounded-full relative shadow-inner cursor-pointer transition-colors">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Appearance" && (
              <div className="flex flex-col gap-6">
                 <div className="flex flex-col rounded-[16px] bg-sidebar p-6 border border-borderMain gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-textMain mb-1">Theme</h3>
                      <p className="text-[13px] text-textMuted">Select your desired aesthetic interface theme.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                       {themes.map(t => (
                         <button
                           key={t.id}
                           onClick={() => setTheme(t.id)}
                           className={`px-4 py-2.5 rounded-apple text-sm font-medium transition-all shadow-sm ${theme === t.id ? 'bg-accent text-white ring-2 ring-accent ring-offset-2 ring-offset-background' : 'bg-background text-textMain border border-borderMain hover:bg-sidebarHover'}`}
                         >
                           {t.name}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {(activeTab === "Privacy & Safety" || activeTab === "Notifications") && (
              <div className="flex h-40 items-center justify-center rounded-[16px] border border-dashed border-borderMain pt-4 mt-8">
                <span className="text-sm text-textMuted">Settings for {activeTab} are coming soon.</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t border-borderMain bg-sidebar p-4 flex justify-end gap-3 rounded-br-[20px] shrink-0">
            <button 
              onClick={onClose}
              className="rounded-apple px-6 py-2.5 text-sm font-medium text-textMuted hover:text-textMain hover:bg-sidebarHover transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="rounded-apple bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
