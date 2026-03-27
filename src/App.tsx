import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Database, 
  FileText, 
  X,
  Heart,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Upload,
  Terminal,
  Zap,
  Brain,
  ChevronRight,
  Clock,
  Server,
  Code,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Bot,
  Send,
  Users,
  BarChart3,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================
type UserRole = 'CDM' | 'CDB' | 'ADMIN';
type UploadState = 'idle' | 'uploading' | 'parsing' | 'complete' | 'error';
type FieldStatus = 'pending' | 'approved' | 'flagged';
type LogLevel = 'info' | 'warning' | 'error' | 'success';

interface ProtocolField {
  id: string;
  name: string;
  type: string;
  range?: string;
  domain: string;
  status: FieldStatus;
  approvedBy?: string;
  comments: Comment[];
  extractedAt: string;
}

interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  domain?: string;
}

interface SDTMMapping {
  id: string;
  sourceField: string;
  targetDomain: string;
  targetVariable: string;
  status: 'mapped' | 'pending' | 'conflict';
  lastUpdated: string;
}

interface FaroSuggestion {
  id: string;
  type: 'info' | 'warning' | 'action';
  title: string;
  description: string;
  actions: string[];
}

// ==================== MOCK DATA ====================
const MOCK_PROTOCOL_FIELDS: ProtocolField[] = [
  {
    id: '1',
    name: 'Age',
    type: 'Numeric',
    range: '18 - 99',
    domain: 'DM',
    status: 'approved',
    approvedBy: 'Sarah Chen',
    comments: [],
    extractedAt: '2 min ago'
  },
  {
    id: '2',
    name: 'Sex',
    type: 'Categorical',
    range: 'M/F/U',
    domain: 'DM',
    status: 'flagged',
    comments: [
      { id: 'c1', author: 'Mike Ross', role: 'CDB', text: 'Should we include "Prefer not to say" option?', timestamp: '1 min ago' }
    ],
    extractedAt: '3 min ago'
  },
  {
    id: '3',
    name: 'Systolic BP',
    type: 'Numeric',
    range: '90 - 200 mmHg',
    domain: 'VS',
    status: 'pending',
    comments: [],
    extractedAt: '4 min ago'
  },
  {
    id: '4',
    name: 'Diastolic BP',
    type: 'Numeric',
    range: '60 - 120 mmHg',
    domain: 'VS',
    status: 'pending',
    comments: [],
    extractedAt: '4 min ago'
  },
  {
    id: '5',
    name: 'Adverse Event Term',
    type: 'Text',
    domain: 'AE',
    status: 'flagged',
    comments: [
      { id: 'c2', author: 'Sarah Chen', role: 'CDM', text: 'MedDRA coding required - flag for medical review', timestamp: '2 min ago' }
    ],
    extractedAt: '5 min ago'
  },
  {
    id: '6',
    name: 'Concomitant Medication',
    type: 'Text',
    domain: 'CM',
    status: 'pending',
    comments: [],
    extractedAt: '5 min ago'
  }
];

const MOCK_SYSTEM_LOGS: SystemLog[] = [
  { id: '1', timestamp: '10:42:15', level: 'success', message: 'DM.SUBJID → USUBJID mapping validated', domain: 'DM' },
  { id: '2', timestamp: '10:42:12', level: 'info', message: 'SDTM dataset DM updated - 1,247 records', domain: 'DM' },
  { id: '3', timestamp: '10:41:58', level: 'error', message: 'VS.VSTESTCD mapping conflict: "BP" vs "Blood Pressure"', domain: 'VS' },
  { id: '4', timestamp: '10:41:45', level: 'warning', message: 'AE.AETERM: 23 records require manual MedDRA coding', domain: 'AE' },
  { id: '5', timestamp: '10:41:30', level: 'success', message: 'Database backup completed - 2.3GB', domain: 'SYSTEM' },
  { id: '6', timestamp: '10:41:15', level: 'info', message: 'Query job #4582 started for LB domain', domain: 'LB' },
  { id: '7', timestamp: '10:40:52', level: 'error', message: 'Connection timeout to SAS server (10.0.1.45)', domain: 'SYSTEM' },
  { id: '8', timestamp: '10:40:30', level: 'warning', message: 'SV.VISITNUM duplicate values detected', domain: 'SV' }
];

const MOCK_SDTM_MAPPINGS: SDTMMapping[] = [
  { id: '1', sourceField: 'subject_id', targetDomain: 'DM', targetVariable: 'USUBJID', status: 'mapped', lastUpdated: '2 min ago' },
  { id: '2', sourceField: 'site_number', targetDomain: 'DM', targetVariable: 'SITEID', status: 'mapped', lastUpdated: '5 min ago' },
  { id: '3', sourceField: 'systolic_bp', targetDomain: 'VS', targetVariable: 'VSSTRESN', status: 'conflict', lastUpdated: '1 min ago' },
  { id: '4', sourceField: 'visit_date', targetDomain: 'SV', targetVariable: 'SVSTDTC', status: 'mapped', lastUpdated: '3 min ago' },
  { id: '5', sourceField: 'ae_description', targetDomain: 'AE', targetVariable: 'AETERM', status: 'pending', lastUpdated: 'Just now' }
];

const MOCK_FARO_SUGGESTIONS: FaroSuggestion[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Protocol Version Mismatch',
    description: 'Protocol v3.1 detected with 5 field changes from current CRF. Should I update specifications?',
    actions: ['Review Changes', 'Apply Update', 'Dismiss']
  },
  {
    id: '2',
    type: 'action',
    title: 'SDTM Mapping Conflict',
    description: '3 VS domain mappings have conflicting values. Manual review required.',
    actions: ['View Conflicts', 'Auto-Resolve', 'Ignore']
  },
  {
    id: '3',
    type: 'info',
    title: 'Database Optimization',
    description: 'Query performance can be improved by 23% with new indexing.',
    actions: ['Apply Index', 'Schedule', 'Dismiss']
  }
];

// ==================== COMPONENTS ====================

// Role Switcher Component
const RoleSwitcher = ({ currentRole, onRoleChange }: { currentRole: UserRole; onRoleChange: (role: UserRole) => void }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {(['CDM', 'CDB', 'ADMIN'] as UserRole[]).map((role) => (
        <button
          key={role}
          onClick={() => onRoleChange(role)}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            currentRole === role
              ? 'bg-[#DC2626] text-white shadow-lg'
              : 'text-gray-600 hover:bg-white hover:shadow-sm'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

// Faro AI Sidebar
const FaroSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [chatInput, setChatInput] = useState('');
  const [suggestions] = useState(MOCK_FARO_SUGGESTIONS);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-red-800 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Faro AI</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online • Processing
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-200px)]">
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    suggestion.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    suggestion.type === 'action' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {suggestion.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {suggestion.type === 'action' && <Zap className="w-4 h-4" />}
                    {suggestion.type === 'info' && <Brain className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">{suggestion.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {suggestion.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        idx === 0 
                          ? 'bg-[#DC2626] text-white hover:bg-red-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Faro anything..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#DC2626] text-white rounded-lg hover:bg-red-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Protocol Dropzone Component
const ProtocolDropzone = ({ onUpload }: { onUpload: () => void }) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setUploadState('uploading');
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('parsing');
          setTimeout(() => {
            setUploadState('complete');
            onUpload();
            setTimeout(() => setUploadState('idle'), 3000);
          }, 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-8"
      whileHover={{ scale: 1.01, borderColor: '#DC2626' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {uploadState === 'idle' && (
        <>
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#DC2626]/10 to-red-100 rounded-2xl flex items-center justify-center">
            <Upload className="w-10 h-10 text-[#DC2626]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop Protocol PDF Here</h3>
          <p className="text-gray-500 mb-6">or click to browse files</p>
          <button
            onClick={handleUpload}
            className="px-6 py-3 bg-[#DC2626] text-white rounded-xl font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/30"
          >
            Upload Protocol
          </button>
        </>
      )}

      {uploadState === 'uploading' && (
        <div className="py-4">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <motion.div 
              className="absolute inset-0 border-4 border-gray-200 rounded-full"
            />
            <motion.div 
              className="absolute inset-0 border-4 border-[#DC2626] rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-[#DC2626]">{progress}%</span>
          </div>
          <p className="text-gray-600 font-medium">Uploading protocol...</p>
        </div>
      )}

      {uploadState === 'parsing' && (
        <div className="py-4">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="w-16 h-16 text-[#DC2626]" />
            </motion.div>
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">AI Analyzing Protocol Structure</p>
          <div className="flex justify-center gap-2">
            <motion.span 
              className="w-2 h-2 bg-[#DC2626] rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span 
              className="w-2 h-2 bg-[#DC2626] rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span 
              className="w-2 h-2 bg-[#DC2626] rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-3">Extracting CRF specifications...</p>
        </div>
      )}

      {uploadState === 'complete' && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-4"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-green-600 font-bold text-lg">Protocol Parsed Successfully!</p>
          <p className="text-gray-500">28 fields extracted • Ready for review</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Protocol Field Card
const ProtocolFieldCard = ({ field, onApprove, onFlag }: { 
  field: ProtocolField; 
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  return (
    <motion.div 
      layout
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
        field.status === 'approved' ? 'border-green-400 shadow-green-100' :
        field.status === 'flagged' ? 'border-[#DC2626] shadow-red-100' :
        'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
            field.domain === 'DM' ? 'bg-blue-100 text-blue-600' :
            field.domain === 'VS' ? 'bg-green-100 text-green-600' :
            field.domain === 'AE' ? 'bg-red-100 text-red-600' :
            field.domain === 'CM' ? 'bg-purple-100 text-purple-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {field.domain}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{field.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded-md">{field.type}</span>
              {field.range && <span>• {field.range}</span>}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400">{field.extractedAt}</span>
      </div>

      {field.status === 'approved' && (
        <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
          <CheckCircle className="w-4 h-4" />
          <span>Approved by {field.approvedBy}</span>
        </div>
      )}

      {field.status === 'flagged' && field.comments.length > 0 && (
        <div className="bg-red-50 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{field.comments[0].author} ({field.comments[0].role})</p>
              <p className="text-sm text-gray-600">{field.comments[0].text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onApprove(field.id)}
          disabled={field.status === 'approved'}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            field.status === 'approved'
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 active:scale-95'
          }`}
        >
          <Heart className={`w-4 h-4 ${field.status === 'approved' ? 'fill-current' : ''}`} />
          {field.status === 'approved' ? 'Approved' : 'Approve'}
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            field.status === 'flagged'
              ? 'bg-red-100 text-[#DC2626]'
              : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-[#DC2626] active:scale-95'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Comment{field.comments.length > 0 && ` (${field.comments.length})`}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            field.status === 'approved' ? 'bg-green-500' :
            field.status === 'flagged' ? 'bg-[#DC2626]' :
            'bg-gray-400'
          }`} />
          <span className="text-xs text-gray-500 capitalize">{field.status}</span>
        </div>
      </div>

      {showComments && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="space-y-3 mb-3">
            {field.comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold">
                  {comment.author[0]}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">({comment.role})</span>
                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <button
              onClick={() => { onFlag(field.id); setShowComments(false); }}
              className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-sm font-medium hover:bg-red-700 active:scale-95 transition-all"
            >
              Flag
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Database Health Card
const DatabaseHealthCard = () => {
  const metrics = [
    { label: 'Database Status', value: 'Healthy', status: 'good', icon: Database },
    { label: 'Connection Pool', value: '78%', status: 'warning', icon: Server },
    { label: 'Query Response', value: '45ms', status: 'good', icon: Zap },
    { label: 'SDTM Coverage', value: '89%', status: 'good', icon: FileCheck }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Database Health</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${
                metric.status === 'good' ? 'text-green-600' :
                metric.status === 'warning' ? 'text-amber-600' :
                'text-red-600'
              }`} />
              <span className="text-xs text-gray-500">{metric.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${
                metric.status === 'good' ? 'text-gray-900' :
                metric.status === 'warning' ? 'text-amber-600' :
                'text-red-600'
              }`}>{metric.value}</span>
              {metric.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            {metric.label === 'Connection Pool' && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// System Logs Terminal
const SystemLogsTerminal = () => {
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = filter === 'all' 
    ? MOCK_SYSTEM_LOGS 
    : MOCK_SYSTEM_LOGS.filter(log => log.level === filter);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'text-[#DC2626]';
      case 'warning': return 'text-amber-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
    }
  };

  const getLevelBg = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'bg-red-500/20';
      case 'warning': return 'bg-amber-500/20';
      case 'success': return 'bg-green-500/20';
      case 'info': return 'bg-blue-500/20';
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-3 h-3" />;
      case 'warning': return <AlertTriangle className="w-3 h-3" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      case 'info': return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#DC2626]" />
          <span className="text-white font-semibold">System Logs</span>
          <span className="px-2 py-0.5 bg-[#DC2626] text-white text-xs rounded-md">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'error', 'warning', 'info'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === f 
                  ? 'bg-[#DC2626] text-white' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 overflow-y-auto p-4 font-mono text-sm space-y-2">
        {filteredLogs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3"
          >
            <span className="text-gray-500 text-xs">{log.timestamp}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getLevelBg(log.level)} ${getLevelColor(log.level)} flex items-center gap-1`}>
              {getLevelIcon(log.level)}
              {log.level.toUpperCase()}
            </span>
            <span className={`flex-1 ${getLevelColor(log.level)}`}>
              [{log.domain}] {log.message}
            </span>
          </motion.div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

// SDTM Mapping Feed
const SDTMMappingFeed = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-red-800 flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">SDTM Mapping Feed</h3>
            <p className="text-sm text-gray-500">Real-time data flow to standards</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_SDTM_MAPPINGS.map((mapping, index) => (
          <motion.div
            key={mapping.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-gray-900">{mapping.sourceField}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="font-mono text-sm text-[#DC2626]">{mapping.targetDomain}.{mapping.targetVariable}</span>
              </div>
              <p className="text-xs text-gray-500">Last updated {mapping.lastUpdated}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              mapping.status === 'mapped' ? 'bg-green-100 text-green-700' :
              mapping.status === 'conflict' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {mapping.status === 'mapped' && <CheckCircle className="w-3 h-3 inline mr-1" />}
              {mapping.status === 'conflict' && <AlertCircle className="w-3 h-3 inline mr-1" />}
              {mapping.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
              {mapping.status.charAt(0).toUpperCase() + mapping.status.slice(1)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  const [role, setRole] = useState<UserRole>('CDM');
  const [faroOpen, setFaroOpen] = useState(false);
  const [fields, setFields] = useState<ProtocolField[]>(MOCK_PROTOCOL_FIELDS);
  const [activeTab, setActiveTab] = useState<'feed' | 'mapping' | 'logs'>('feed');

  const handleApprove = (id: string) => {
    setFields(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: 'approved', approvedBy: 'You' }
        : f
    ));
  };

  const handleFlag = (id: string) => {
    setFields(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: 'flagged' }
        : f
    ));
  };

  const approvedCount = fields.filter(f => f.status === 'approved').length;
  const flaggedCount = fields.filter(f => f.status === 'flagged').length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-red-800 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClearTrial</h1>
                <p className="text-xs text-gray-500">AI-Powered EDC Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Protocol v2.4</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>12 Sites Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>156 Subjects</span>
                </div>
              </div>
              
              <RoleSwitcher currentRole={role} onRoleChange={setRole} />

              <button
                onClick={() => setFaroOpen(!faroOpen)}
                className="p-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-red-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {role === 'CDM' ? (
            <motion.div
              key="cdm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* CDM Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Protocol-to-CRF Command Center</h2>
                    <p className="text-gray-600">AI-powered protocol analysis and CRF design studio</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
                      <p className="text-xs text-gray-500">Fields Found</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                      <p className="text-xs text-gray-500">Approved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#DC2626]">{flaggedCount}</p>
                      <p className="text-xs text-gray-500">Flagged</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Dropzone */}
              <ProtocolDropzone onUpload={() => {}} />

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Review Progress</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round((approvedCount / fields.length) * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#DC2626] to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(approvedCount / fields.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Fields Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fields.map((field) => (
                  <ProtocolFieldCard
                    key={field.id}
                    field={field}
                    onApprove={handleApprove}
                    onFlag={handleFlag}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cdb"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* CDB Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Technical Infrastructure</h2>
                    <p className="text-gray-600">Database health monitoring and SDTM mapping management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('feed')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeTab === 'feed' 
                          ? 'bg-[#DC2626] text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Health
                    </button>
                    <button
                      onClick={() => setActiveTab('mapping')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeTab === 'mapping' 
                          ? 'bg-[#DC2626] text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Mapping
                    </button>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeTab === 'logs' 
                          ? 'bg-[#DC2626] text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Logs
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              {activeTab === 'feed' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DatabaseHealthCard />
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4">Active Jobs</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 flex items-center justify-center">
                              <Play className="w-4 h-4 text-[#DC2626]" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Query #4582</p>
                              <p className="text-xs text-gray-500">LB Domain • 23%</p>
                            </div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-[#DC2626] rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                              <Pause className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Backup #892</p>
                              <p className="text-xs text-gray-500">Paused • 67%</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-amber-600">Paused</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mapping' && (
                <SDTMMappingFeed />
              )}

              {activeTab === 'logs' && (
                <SystemLogsTerminal />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Faro AI Sidebar */}
      <FaroSidebar isOpen={faroOpen} onClose={() => setFaroOpen(false)} />

      {/* Overlay */}
      <AnimatePresence>
        {faroOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setFaroOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
