const BASE_URL = import.meta.env.VITE_BACKEND_URL;
import React, { useState, useEffect } from 'react';

import Login from './login';
import axios from 'axios';
import { useMsal } from "@azure/msal-react";


import {
  Box,
  Typography,
  Container,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Masonry } from '@mui/lab';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import DeleteIcon from '@mui/icons-material/Delete';

const teamMembers = [
  { name: 'arindam halder', role: 'Manager Pre Sales', username: 'arindam.halder@vikramsolar.com', gender: 'male' },
  { name: 'aritra de', role: 'Asst Manager R&D', username: 'aritra.de@vikramsolar.com', gender: 'male' },
  { name: 'arup mahapatra', role: 'Deputy Manager R&D', username: 'arup.mahapatra@vikramsolar.com', gender: 'male' },
  { name: 'deepanjana adak', role: 'Senior Manager R&D', username: 'deepanjana.adak@vikramsolar.com', gender: 'female' },
  { name: 'gopal kumar', role: 'AGM R&D', username: 'gopal.kumar@vikramsolar.com', gender: 'male' },
  { name: 'jai jaiswal', role: 'Senior Manager R&D', username: 'jai.jaiswal@vikramsolar.com', gender: 'male' },
  { name: 'krishanu ghosh', role: 'Engineer R&D', username: 'krishanu.ghosh@vikramsolar.com', gender: 'male' },
  { name: 'naveen chamaria', role: 'GET R&D', username: 'naveen.chamaria@vikramsolar.com', gender: 'male' },
  { name: 'samaresh', role: 'Senior Executive R&D', username: 'samaresh.banerjee@vikramsolar.com', gender: 'male' },
  { name: 'shakya acharya', role: 'Manager R&D', username: 'shakya.acharya@vikramsolar.com', gender: 'male' },
  { name: 'soumya ghosal', role: 'Manager Pre Sales', username: 'soumya.ghosal@vikramsolar.com', gender: 'male' },
  { name: 'tannu', role: 'Senior Manager R&D', username: 'tannu.barnwal@vikramsolar.com', gender: 'female' },
  { name: 'tanushree roy', role: 'Deputy Manager Technology R&D', username: 'tanushree.roy@vikramsolar.com', gender: 'female' },
];

function App({toggleMode}) {
  
    const [token, setToken] = useState('');
    const [user, setUser] = useState('');
  
    const { accounts } = useMsal();
  
    useEffect(() => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        setToken(savedToken);
  
        // If login is from SSO, pull user from Microsoft
        if (accounts.length > 0) {
          setUser(accounts[0].username);
        } else {
          // fallback: maybe from manual login
          const savedUser = localStorage.getItem('user');
          if (savedUser) setUser(savedUser);
        }
      }
    }, [accounts]);
  


  // Dialog for adding new tasks
  const [openDialog, setOpenDialog] = useState(false);
  // Dialog for editing an existing task
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Current member from card click
  const [currentMember, setCurrentMember] = useState('');
  
  // States for new task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('low');
  // Tasks to be submitted (locally added)
  const [taskList, setTaskList] = useState([]);
  // Tasks fetched from backend
  const [backendTasks, setBackendTasks] = useState([]);
  // State for task being edited
  const [editTask, setEditTask] = useState(null);
  
  // UI states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // When a team member card is clicked, open the dialog for adding tasks
  const handleCardClick = (memberName) => {
    setCurrentMember(memberName);
    setTaskList([]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('low');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Add a new task locally (with current timestamp)
  const handleAddTask = () => {
    if (taskTitle.trim() === '') {
      setSnackbar({ open: true, message: 'Please enter a valid task title.', severity: 'warning' });
      return;
    }
    const timestamp = new Date().toLocaleString();
    const newTask = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      priority: taskPriority,
      timestamp,
    };
    setTaskList([...taskList, newTask]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('low');
    setSnackbar({ open: true, message: 'Task added successfully!', severity: 'success' });
  };

  // Remove a task from the local list
  const handleRemoveTask = (index) => {
    const newTaskList = taskList.filter((_, i) => i !== index);
    setTaskList(newTaskList);
  };

  const handleClearAll = () => {
    setTaskList([]);
    setSnackbar({ open: true, message: 'All tasks cleared!', severity: 'info' });
  };

  // Submit tasks: for each task, send a POST request to the API
  const handleSubmit = async () => {
    if (taskList.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one task before submitting.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      for (const task of taskList) {
        await axios.post(`${BASE_URL}/api/tasks`, {
          title: task.title,
          description: task.description,
          priority: task.priority,
          timestamp: task.timestamp,
          user: user
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      const submissionTime = new Date().toLocaleString();
      setSnackbar({ open: true, message: `Tasks for ${currentMember} submitted at ${submissionTime}!`, severity: 'success' });
      setTaskList([]);
      setOpenDialog(false);
      fetchBackendTasks();
    } catch (error) {
      setSnackbar({ open: true, message: `Error submitting tasks: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for the current member from the backend
  const fetchBackendTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const myTasks = response.data.filter(task => task.user === user);
setBackendTasks(myTasks);
 // No need to filter
    } catch (error) {
      setSnackbar({ open: true, message: `Error fetching tasks: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadMyReport = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/last-month`, {
        responseType: 'blob', // important to handle binary data (PDF)
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${currentMember.replace(/\s+/g, '_')}_Last_Month_Tasks.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setSnackbar({ open: true, message: `❌ Failed to download report: ${error.message}`, severity: 'error' });
    }
  };
  


  // Delete a task via API
  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSnackbar({ open: true, message: 'Task deleted successfully!', severity: 'success' });
      fetchBackendTasks();
    } catch (error) {
      setSnackbar({ open: true, message: `Error deleting task: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open the edit dialog for a specific task
  const openEditDialog = (task) => {
    setEditTask(task);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditTask(null);
  };

  // Update a task via API (PUT)
  const handleUpdateTask = async () => {
    if (!editTask) return;
    setEditLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/tasks/${editTask.id}`, {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
      handleEditDialogClose();
      fetchBackendTasks();
    } catch (error) {
      setSnackbar({ open: true, message: `Error updating task: ${error.message}`, severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  if (!token) {
    return <Login setToken={setToken} setUser={setUser} />;
  }


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: "url('https://source.unsplash.com/1600x900/?technology,office') no-repeat center center fixed",
        backgroundSize: 'cover',
        position: 'relative',
        
        p: 2,
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(240, 204, 204, 0.86)',
          zIndex: 0,
        },
      }}
    >
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
  <Button
    variant="contained"
    color="error"
    onClick={() => {
      localStorage.removeItem('token');
      setToken('');
      setUser('');
    }}
  >
    Logout
  </Button>
</Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" color="#b30000" gutterBottom>
                R&D Daily Task Portal
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Log yesterday's tasks (10 AM - 12 PM) and be part of history!
              </Typography>
              <Button
    onClick={toggleMode}
    variant="outlined"
    color="inherit"
    sx={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1500,
      bgcolor: 'background.paper',
    }}
  >
    Toggle Theme
  </Button>
            </Box>
            <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
              {teamMembers.map((member) => (
                <Paper
                  key={member.name}
                  elevation={3}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-10px)' },
                    border: member.name.toLowerCase() === user.toLowerCase() ? '2px solid #b30000' : '1px solid lightgray',

                  }}
                  onClick={() => {
                    if (member.username.toLowerCase() === user.toLowerCase()) {
                      handleCardClick(member.name);
                    } else {
                      setSnackbar({ open: true, message: 'You can only log your own tasks.', severity: 'warning' });
                    }
                  }}
                  
                >
                  <CardActionArea>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {member.gender === 'male' ? (
                          <ManIcon sx={{ fontSize: 60, color: '#b30000' }} />
                        ) : (
                          <WomanIcon sx={{ fontSize: 60, color: '#b30000' }} />
                        )}
                      </Box>
                      <Typography variant="h6" color="#b30000" sx={{ textTransform: 'uppercase' }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.role}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Paper>
              ))}
            </Masonry>
          </Paper>
        </Container>

        {/* Section: My Submitted Tasks */}
        {currentMember && (
  <Container sx={{ mb: 4 }}>
    <Paper
      elevation={6}
      sx={{
        p: 4,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ flexGrow: 1 }} color="#b30000">
                {user}'s Submitted Tasks
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
  <Button variant="contained" color="error" onClick={fetchBackendTasks} disabled={loading}>
    {loading ? <CircularProgress size={24} color="inherit" /> : 'Refresh'}
  </Button>

  <Button variant="contained" color="error" onClick={handleDownloadMyReport}>
    Download My Report
  </Button>
</Box>

            </Box>
            {backendTasks.length > 0 ? (
              <List>
                {backendTasks.map((task) => (
                  <ListItem key={task._id || task.id || index} secondaryAction={
                    <>
                      <Button variant="outlined" color="primary" onClick={() => openEditDialog(task)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleDeleteTask(task.id)}>
                        Delete
                      </Button>
                    </>
                  }>
                    <ListItemText
                      primary={`${task.title} (${task.priority})`}
                      secondary={`Description: ${task.description} – Added on: ${task.timestamp}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="#b30000">No tasks submitted yet.</Typography>
            )}
            </Paper>
          </Container>
        )}

        {/* Dialog for Adding Tasks */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle align="center" sx={{ color: '#b30000' }}>
            Log Tasks for {currentMember}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Task Title"
                variant="outlined"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <TextField
                fullWidth
                label="Task Description"
                variant="outlined"
                multiline
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel id="priority-label">Task Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Task Priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleAddTask}>
                Add Task
              </Button>
              {taskList.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Task List ({taskList.length})
                  </Typography>
                  <List>
                    {taskList.map((task, index) => (
                      <ListItem
                      key={task._id || task.id || index}
                        secondaryAction={
                          <IconButton edge="end" color="error" onClick={() => handleRemoveTask(index)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`${task.title} (${task.priority})`}
                          secondary={`Description: ${task.description} – Added on: ${task.timestamp}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button variant="outlined" color="error" onClick={handleClearAll} disabled={taskList.length === 0}>
              Clear All
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Tasks'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Editing Tasks */}
        <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
          <DialogTitle align="center" sx={{ color: '#b30000' }}>
            Edit Task
          </DialogTitle>
          <DialogContent>
            {editTask && (
              <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Task Title"
                  variant="outlined"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Task Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel id="edit-priority-label">Task Priority</InputLabel>
                  <Select
                    labelId="edit-priority-label"
                    label="Task Priority"
                    value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleUpdateTask} disabled={editLoading}>
              {editLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Task'}
            </Button>
            <Button variant="outlined" onClick={handleEditDialogClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box sx={{ bgcolor: 'rgba(179, 0, 0, 0.85)', py: 2, mt: 4 }}>
          <Container>
            <Typography variant="body1" align="center" color="white">
              &copy; 2025 R&D Task Portal - Crafted with ♡
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
