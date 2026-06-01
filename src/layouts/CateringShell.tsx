import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from './AppLayout';
import { RoleContext, type Role } from '@/lib/roles';
import { WorkflowProvider } from '@/lib/workflow-store';
import { Toaster } from '@/components/ui/sonner';
import { isAuthenticated, getAuthUser, clearAuthUser } from '@/lib/auth';

const SHELL_BYPASS = ['/login'];

export function CateringShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isShellBypassed = SHELL_BYPASS.includes(pathname);

  const [role, setRole] = useState<Role>('GM/Admin');

  useEffect(() => {
    if (!isShellBypassed && !isAuthenticated()) navigate('/login');
  }, [isShellBypassed, navigate]);

  if (isShellBypassed) {
    return (
      <RoleContext.Provider value={{ role, setRole }}>
        <WorkflowProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </WorkflowProvider>
      </RoleContext.Provider>
    );
  }

  if (!isAuthenticated()) return null;

  const user = getAuthUser();
  const currentUser = user ? { userId: user.userId, displayName: user.name } : undefined;

  const handleSignOut = () => {
    clearAuthUser();
    navigate('/login');
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <WorkflowProvider>
        <AppLayout currentUser={currentUser} onSignOut={handleSignOut}>
          <Outlet />
        </AppLayout>
        <Toaster richColors position="top-right" />
      </WorkflowProvider>
    </RoleContext.Provider>
  );
}
