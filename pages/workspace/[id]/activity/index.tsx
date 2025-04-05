import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, Fragment} from "react";
import { useRecoilState } from "recoil";
import Button from "@/components/button";
import { Dialog, Transition } from "@headlessui/react";
import moment from "moment";
import { IconChevronRight, IconUsers, IconClock, IconChartBar, IconUserCircle, IconMessageCircle2 } from "@tabler/icons";
import Tooltip from "@/components/tooltip";
import randomText from "@/utils/randomText";
import toast, { Toaster } from 'react-hot-toast';

const Activity: pageWithLayout = () => {
	const router = useRouter();
	const { id } = router.query;

	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const text = useMemo(() => randomText(login.displayname), []);
	const [activeUsers, setActiveUsers] = useState([]);
	const [inactiveUsers, setInactiveUsers] = useState([]);
	const [isOpen, setIsOpen] = useState(false);

	const [topStaff, setTopStaff] = useState([]);
	const [messages, setMessages] = useState(0);
	const [idleTime, setIdleTime] = useState(0);

	async function resetActivity() {
		setIsOpen(false);
		toast.promise(
			axios.post(`/api/workspace/${id}/activity/reset`),
			{
				loading: "Resetting activity...",
				success: <b>Activity has been reset!</b>,
				error: <b>Activity was not reset due to an unknown error.</b>
			}
		);
	}

	useEffect(() => {
		async function fetchUsers() {
			return await axios.get(`/api/workspace/${id}/activity/users`);
		}

		async function fetchStats() {
			return await axios.get(`/api/workspace/${id}/activity/stats`);
		}

		function setData() {
			fetchUsers().then(({ data }) => {
				setActiveUsers(data.message.activeUsers);
				setInactiveUsers(data.message.inactiveUsers);
				setTopStaff(data.message.topStaff)
			});

			fetchStats().then(({ data }) => {
				setMessages(data.message.messages);
				setIdleTime(data.message.idle);
			});
		}

		setData();
		const interval = setInterval(setData, 10000);

		return () => clearInterval(interval);
	}, [id]);

	return <>
		<div className="pagePadding">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center gap-3 mb-6">
					<h1 className="text-2xl font-medium text-gray-900">{text}</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconMessageCircle2 className="w-5 h-5 text-primary" />
							</div>
							<p className="text-sm font-medium text-gray-600">Messages</p>
						</div>
						<p className="text-3xl font-semibold text-gray-900">{messages}</p>
					</div>

					<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconClock className="w-5 h-5 text-primary" />
							</div>
							<p className="text-sm font-medium text-gray-600">Idle Time</p>
						</div>
						<p className="text-3xl font-semibold text-gray-900">{Math.round(idleTime)}m</p>
					</div>

					<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconUsers className="w-5 h-5 text-primary" />
							</div>
							<p className="text-sm font-medium text-gray-600">Active Staff</p>
						</div>
						<p className="text-3xl font-semibold text-gray-900">{activeUsers.length}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
					<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 p-2 rounded-lg">
									<IconUsers className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-base font-medium text-gray-900">In-game Staff</h2>
									<p className="text-sm text-gray-500">Currently active members</p>
								</div>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{activeUsers.map((user: any) => (
								<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId})`} orientation="top">
									<div className="relative group">
										<img
											src={user.picture}
											alt={user.username}
											className="w-10 h-10 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
										/>
										<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
									</div>
								</Tooltip>
							))}
							{activeUsers.length === 0 && (
								<p className="text-sm text-gray-500 italic">No staff are currently in-game</p>
							)}
						</div>
					</div>

					<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 p-2 rounded-lg">
									<IconUserCircle className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-base font-medium text-gray-900">Inactive Staff</h2>
									<p className="text-sm text-gray-500">Staff on inactivity notice</p>
								</div>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{inactiveUsers.map((user: any) => (
								<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId}) | ${moment(user.from).format("DD MMM")} - ${moment(user.to).format("DD MMM")} for ${user.reason}`} orientation="bottom">
									<div className="relative group">
										<img
											src={user.picture}
											alt={user.username}
											className="w-10 h-10 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all opacity-60"
										/>
									</div>
								</Tooltip>
							))}
							{inactiveUsers.length === 0 && (
								<p className="text-sm text-gray-500 italic">No staff are currently inactive</p>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all mb-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconChartBar className="w-5 h-5 text-primary" />
							</div>
							<div>
								<h2 className="text-base font-medium text-gray-900">Top Staff</h2>
								<p className="text-sm text-gray-500">Leading members by activity</p>
							</div>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{topStaff.slice(0, 5).map((user: any) => (
							<Tooltip key={user.userId} tooltipText={`${user.username} (${user.userId}) - ${Math.floor(user.ms / 1000 / 60)} minutes`} orientation="bottom">
								<div className="relative group">
									<img
										src={user.picture}
										alt={user.username}
										className="w-10 h-10 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
									/>
								</div>
							</Tooltip>
						))}
						{topStaff.length === 0 && (
							<p className="text-sm text-gray-500 italic">No staff have been active yet</p>
						)}
					</div>
				</div>

				<div className="mb-4">
					<h2 className="text-base font-medium text-gray-900">Quick Actions</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
					{workspace.yourPermission.includes('manage_activity') && (
						<button 
							onClick={() => router.push(`/workspace/${id}/notices/pending`)}
							className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
						>
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconUsers className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">View Notices</p>
								<p className="text-xs text-gray-500">Review pending notices</p>
							</div>
						</button>
					)}
					<button 
						onClick={() => router.push(`/workspace/${id}/profile/${login.userId}`)}
						className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
					>
						<div className="bg-primary/10 p-2 rounded-lg">
							<IconUserCircle className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-900">My Profile</p>
							<p className="text-xs text-gray-500">View your profile</p>
						</div>
					</button>
					<button 
						onClick={() => router.push(`/workspace/${id}/notices`)}
						className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
					>
						<div className="bg-primary/10 p-2 rounded-lg">
							<IconClock className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-900">My Notices</p>
							<p className="text-xs text-gray-500">View your notices</p>
						</div>
					</button>
					{workspace.yourPermission.includes('manage_activity') && (
						<button 
							onClick={() => setIsOpen(true)}
							className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
						>
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconChartBar className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">New Timeframe</p>
								<p className="text-xs text-gray-500">Reset activity period</p>
							</div>
						</button>
					)}
					{workspace.yourPermission.includes('admin') && (
						<button 
							onClick={() => router.push(`/workspace/${id}/activity/quotas`)}
							className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
						>
							<div className="bg-primary/10 p-2 rounded-lg">
								<IconChartBar className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">Manage Quotas</p>
								<p className="text-xs text-gray-500">Configure quotas</p>
							</div>
						</button>
					)}
				</div>
			</div>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
										Reset Activity Period
									</Dialog.Title>
									<div className="mt-2">
										<p className="text-sm text-gray-500">
											Are you sure you want to create a new timeframe? This will reset all activity data.
										</p>
									</div>

									<div className="mt-4 flex gap-3">
										<button
											type="button"
											className="flex-1 justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
											onClick={() => setIsOpen(false)}
										>
											Cancel
										</button>
										<button
											type="button"
											className="flex-1 justify-center rounded-lg border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
											onClick={() => resetActivity()}
										>
											Reset
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			<Toaster position="bottom-center" />
		</div>
	</>;
}

Activity.layout = workspace

export default Activity