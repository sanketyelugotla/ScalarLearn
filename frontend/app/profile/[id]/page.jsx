'use client';
import { useUser } from '@/context/userContext'; 
import { getDashboard, getSavedResources, updateProfile } from '@/services/user';
import Cookies from 'js-cookie';
import { Pencil, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from "sonner"
import Loading from './Loading';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const token = Cookies.get('token');
  const { user, setUser } = useUser();
  const [quizProgress, setQuizProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    education: '',
    institution: ''
  });
  const { dark } = useUser();
  const [resource, setResource] = useState([]);

  useEffect(() => {
    async function getData() {
      const res = await getDashboard(token);
      const saved = await getSavedResources(token);
      setResource(saved);
    }
    if (token) getData();
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push('/auth?mode=login');
      toast.warning("Please login to continue" );
    }
    const timer = setTimeout(() => {
      setQuizProgress(80);
    }, 300);
    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        education: user.education || '',
        institution: user.institution || ''
      });
    }
  }, [user]);

  if (!token || !user) return <Loading />;

  const quickActions = [
    { label: 'Attempt a Quiz', path: '/quizzes' },
    { label: 'Learning Resources', path: '/resources' },
    { label: 'Read Blogs', path: '/blogs' },
    { label: 'View Project', path: '/projects' }
  ];

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      education: user.education || '',
      institution: user.institution || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateProfile(token, formData);
      setIsEditing(false);
      toast.success('Updated successfully' );
      setUser(updatedUser);
    } catch (error) {
      toast.error('Profile update failed' );

      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background max-w-screen-xl mx-auto p-4 my-4 md:my-8 flex flex-col gap-4"
    >
      <div className="flex w-full gap-4 flex-wrap md:flex-nowrap">
        {/* Profile Info */}
        <motion.div
          layout
          className="relative flex flex-col flex-1/2 border-2 border-border rounded-lg p-4 bg-container-background"
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-buttons"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 absolute top-4 right-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-primary p-2 rounded-md hover:bg-primary-dark transition text-white cursor-pointer"
                >
                  {isLoading ? 'Saving...' : <Save className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelClick}
                  className="bg-destructive p-2 rounded-md hover:bg-destructive-dark transition text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="edit-button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditClick}
                className="absolute top-4 right-4 bg-muted p-2 rounded-md hover:bg-background transition cursor-pointer"
              >
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 m-5">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image
                src={user.image || dark ? "/logo_light.png" : "/logo_dark.png"}
                alt="user"
                width={80}
                height={80}
                className="rounded-full"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col m-2 gap-2 w-full"
                >
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-background border border-border px-3 py-2 rounded-md text-sm text-foreground"
                  />
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-background border border-border px-3 py-2 rounded-md text-sm text-foreground"
                  />
                </motion.form>
              ) : (
                <motion.div
                  key="profile-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col m-2"
                >
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-sm font-medium text-muted-foreground max-w-45 md:max-w-full truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-2 px-5 pb-2">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="text-xs font-medium text-muted-foreground">Education</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="bg-background border border-border px-3 py-2 rounded-md text-sm text-foreground w-full"
                  />
                  <label className="text-xs font-medium text-muted-foreground">Institution</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="bg-background border border-border px-3 py-2 rounded-md text-sm text-foreground w-full"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="view-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Education</label>
                    <div className="bg-muted border border-border px-3 py-2 rounded-md text-sm text-foreground">
                      {user.education || 'Education'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Institution</label>
                    <div className="bg-muted border border-border px-3 py-2 rounded-md text-sm text-foreground">
                      {user.institution || 'Institution'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Saved Items & Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 border border-border rounded-lg bg-container-background p-4 mt-4"
      >
        {/* Quick Actions */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:w-1/3 border border-border rounded-lg p-4 bg-background"
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
          <ul className="flex flex-col gap-3">
            {quickActions.map(({ label, path }, index) => (
              <motion.button
                key={index}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(path)}
                className="w-full cursor-pointer border-border border-2 rounded-md px-4 py-2 text-sm text-foreground bg-background hover:bg-secondary transition text-left"
              >
                {label}
              </motion.button>
            ))}
          </ul>
        </motion.div>

        {/* Saved Items */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="md:w-2/3 border border-border rounded-lg p-4 bg-background"
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Saved Items</h2>
          {resource.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              No saved resources.
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scroll pr-2"
            >
              {resource.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="bg-background border-2 hover:bg-secondary transition border-border p-4 rounded-md text-sm text-foreground"
                >
                  <h3 className="font-medium text-base mb-2">{item.resource?.name || 'Untitled'}</h3>
                  <p className="text-muted-foreground text-xs">Saved on: {new Date(item.savedAt).toLocaleDateString()}</p>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.resource?.description || 'No description'}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}