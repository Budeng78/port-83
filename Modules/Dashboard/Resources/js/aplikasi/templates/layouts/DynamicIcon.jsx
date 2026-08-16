import React from 'react';
import { 
    // Layout & Dashboard
    LayoutDashboard, LayoutGrid, AppWindow, Columns, Grid, Layers,
    // User & Security
    Users, User, UserCheck, UserPlus, UserX, Shield, ShieldCheck, Lock, Unlock, Key, Fingerprint,
    // Files & Storage
    Folder, FolderOpen, FolderPlus, FolderMinus, FileText, File, FilePlus, FileMinus, FileCheck, FileX, Database, Server, HardDrive, Archive, Box, Package, PackageOpen,
    // Settings & System Tools
    Settings, Sliders, Wrench, Cpu, Terminal, Activity, Power, RefreshCw,
    // Analytics & Finance
    BarChart, BarChart2, PieChart, TrendingUp, TrendingDown, LineChart, Wallet, CreditCard, DollarSign, ShoppingBag, ShoppingCart, Percent, Receipt, Tag, Tags, Store,
    // Communication & Notifications
    Mail, MessageSquare, MessagesSquare, MessageCircle, Bell, Send, Phone, Share2, Globe, AtSign,
    // Time & Calendar
    Calendar, Clock, Watch, Timer, Hourglass, History,
    // Navigation & Arrows
    Home, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ExternalLink, Compass, Navigation,
    // Business, Education & Content
    Briefcase, Building, Building2, Award, Bookmark, BookOpen, GraduationCap, Flag, Target, Image, Video, Film, Music, Mic, Camera, Truck,
    // Actions & General UI
    Check, CheckCircle, X, XCircle, AlertCircle, AlertTriangle, Info, HelpCircle, Search, Plus, Trash, Trash2, Edit, MoreHorizontal, MoreVertical, List, Filter, SortAsc, SortDesc, Eye, EyeOff
} from 'lucide-react';

export const DynamicIcon = ({ name, size = 18, strokeWidth = 2, className = '' }) => {
    const iconMap = {
        // Layout & Dashboard
        LayoutDashboard,
        LayoutGrid,
        AppWindow,
        Columns,
        Grid,
        Layers,
        
        // User & Security
        Users,
        User,
        UserCheck,
        UserPlus,
        UserX,
        Shield,
        ShieldCheck,
        Lock,
        Unlock,
        Key,
        Fingerprint,
        
        // Files & Storage
        Folder,
        FolderOpen,
        FolderPlus,
        FolderMinus,
        FileText,
        File,
        FilePlus,
        FileMinus,
        FileCheck,
        FileX,
        Database,
        Server,
        HardDrive,
        Archive,
        Box,
        Package,
        PackageOpen,
        
        // Settings & System Tools
        Settings,
        Sliders,
        Wrench,
        Cpu,
        Terminal,
        Activity,
        Power,
        RefreshCw,
        
        // Analytics & Finance
        BarChart,
        BarChart2,
        PieChart,
        TrendingUp,
        TrendingDown,
        LineChart,
        Wallet,
        CreditCard,
        DollarSign,
        ShoppingBag,
        ShoppingCart,
        Percent,
        Receipt,
        Tag,
        Tags,
        Store,
        
        // Communication & Notifications
        Mail,
        MessageSquare,
        MessagesSquare,
        MessageCircle,
        Bell,
        Send,
        Phone,
        Share2,
        Globe,
        AtSign,

        // Time & Calendar
        Calendar,
        Clock,
        Watch,
        Timer,
        Hourglass,
        History,

        // Navigation & Arrows
        Home,
        ArrowUp,
        ArrowDown,
        ArrowLeft,
        ArrowRight,
        ChevronUp,
        ChevronDown,
        ChevronLeft,
        ChevronRight,
        ChevronsLeft,
        ChevronsRight,
        ExternalLink,
        Compass,
        Navigation,

        // Business, Education & Content
        Briefcase,
        Building,
        Building2,
        Award,
        Bookmark,
        BookOpen,
        GraduationCap,
        Flag,
        Target,
        Image,
        Video,
        Film,
        Music,
        Mic,
        Camera,
        Truck,
        
        // Actions & General UI
        Check,
        CheckCircle,
        X,
        XCircle,
        AlertCircle,
        AlertTriangle,
        Info,
        HelpCircle,
        Search,
        Plus,
        Trash,
        Trash2,
        Edit,
        MoreHorizontal,
        MoreVertical,
        List,
        Filter,
        SortAsc,
        SortDesc,
        Eye,
        EyeOff
    };

    const IconComponent = iconMap[name] || Home;

    return <IconComponent size={size} strokeWidth={strokeWidth} className={className} />;
};