import type { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { IconChevronRight, IconHome, IconLock } from "@tabler/icons";
import Permissions from "@/components/settings/permissions";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { GetServerSideProps } from "next";
import * as All from "@/components/settings/general"
import toast, { Toaster } from 'react-hot-toast';
import * as noblox from "noblox.js";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import prisma from '@/utils/database'
import { getUsername, getThumbnail, getDisplayName } from "@/utils/userinfoEngine";
import { useState } from "react";
import clsx from 'clsx';

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async ({ params, res }) => {
	if (!params?.id) {
		res.statusCode = 404;
		return { props: {} }
	}

	//find users with a role that isnt admin
	const grouproles = await noblox.getRoles(Number(params.id));
	const users = await prisma.user.findMany({
		where: {
			roles: {
				some: {
					workspaceGroupId: parseInt(params.id as string),
					isOwnerRole: false
				}
			}
		},
		include: {
			roles: {
				where: {
					workspaceGroupId: parseInt(params.id as string),
					isOwnerRole: false
				}
			}
		}
	});

	//get roles that arent admin
	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: parseInt(params.id as string),
			isOwnerRole: false
		}
	});

	//promise all to get user with username, displayname and thumbnail
	const usersWithInfo = await Promise.all(users.map(async (user) => {
		const username = user.username || await getUsername(user.userid);
		const thumbnail = user.picture || '';
		const displayName = user.username || await getDisplayName(user.userid);
		return {
			...user,
			userid: Number(user.userid),
			username,
			thumbnail,
			displayName
		}
	}))
	console.log(usersWithInfo)




	return {
		props: {
			users: usersWithInfo,
			roles,
			grouproles
		}
	}
}, 'admin')

type Props = {
	roles: []
	users: []
	grouproles: []
};

const SECTIONS = {
	general: {
		name: 'General',
		icon: IconHome,
		description: 'Basic workspace settings and preferences',
		components: Object.entries(All).map(([key, Component]) => ({
			key,
			component: Component,
			title: Component.title
		}))
	},
	permissions: {
		name: 'Permissions',
		icon: IconLock,
		description: 'Manage roles and user permissions',
		components: []
	}
};

const Settings: pageWithLayout<Props> = ({ users, roles, grouproles }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [activeSection, setActiveSection] = useState('general');

	const renderContent = () => {
		if (activeSection === 'permissions') {
			return (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
					<Permissions users={users} roles={roles} grouproles={grouproles}/>
				</div>
			);
		}

		return SECTIONS.general.components.map(({ component: Component, title }, index) => (
			<div 
				key={index} 
				className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4 last:mb-0"
			>
				<div className="mb-4">
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						{title}
					</h3>
					<Component triggerToast={toast} />
				</div>
			</div>
		));
	};

	return (
		<div className="pagePadding">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
						Settings
					</h1>
					<p className="text-gray-500 mt-1">
						Manage your workspace preferences and configurations
					</p>
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					{/* Navigation Sidebar */}
					<div className="w-full md:w-64 flex-shrink-0">
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
							<nav className="space-y-1">
								{Object.entries(SECTIONS).map(([key, section]) => {
									const Icon = section.icon;
									return (
										<button
											key={key}
											onClick={() => setActiveSection(key)}
											className={clsx(
												'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
												activeSection === key
													? 'text-primary bg-primary/10'
													: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
											)}
										>
											<Icon size={20} />
											<span>{section.name}</span>
											<IconChevronRight
												size={18}
												className={clsx(
													'ml-auto transition-transform',
													activeSection === key ? 'rotate-90' : ''
												)}
											/>
										</button>
									);
								})}
							</nav>
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						<div className="mb-6">
							<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
								{SECTIONS[activeSection as keyof typeof SECTIONS].name}
							</h2>
							<p className="text-gray-500 mt-1">
								{SECTIONS[activeSection as keyof typeof SECTIONS].description}
							</p>
						</div>

						<div className="space-y-4">
							{renderContent()}
						</div>
					</div>
				</div>
			</div>
			<Toaster position="bottom-center" />
		</div>
	);
};

Settings.layout = Workspace;

export default Settings;
