import type { NextPage } from "next";
import { loginState, workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { Menu, Listbox } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconHome, IconWall, IconClipboardList, IconSpeakerphone, IconUsers, IconSettings, IconChevronDown, IconFileText, IconLogout, IconCheck, IconUser, IconBuildingCommunity, IconChevronLeft } from "@tabler/icons";
import Image from "next/image";
import axios from "axios";
import workspace from "@/layouts/workspace";
import { useState } from "react";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (value: boolean) => void;
}

const Sidebar: NextPage<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const pages = [
		{
			name: "Home",
			href: "/workspace/[id]",
			icon: IconHome,
			current: false,
		},
		{
			name: "Wall",
			href: "/workspace/[id]/wall",
			icon: IconWall,
			current: false,
		},
		{
			name: "Activity",
			href: "/workspace/[id]/activity",
			icon: IconClipboardList,
			current: false,
			accessible: workspace.yourPermission.includes('view_entire_groups_activity'),
		},
		{
			name: "Allies",
			href: "/workspace/[id]/allies",
			icon: IconBuildingCommunity,
			
		},
		{
			name: "Sessions",
			href: "/workspace/[id]/sessions",
			accessible: workspace.settings.sessionsEnabled,
			icon: IconSpeakerphone,
			current: false,
		},
		{
			name: "Staff",
			href: "/workspace/[id]/views",
			icon: IconUsers,
			accessible: workspace.yourPermission.includes('view_members'),
			current: false,
		},
		{
			name: "Docs",
			href: "/workspace/[id]/docs",
			icon: IconFileText,
			accessible: workspace.settings.guidesEnabled,
			current: false,
		},
		{
			name: "Settings",
			href: "/workspace/[id]/settings",
			accessible: workspace.yourPermission.includes('admin'),
			icon: IconSettings,
			current: false,
		},
	]

	const gotopage = (page: string) => {
		router.push(page.replace("[id]", workspace.groupId.toString()));
	}
	const router = useRouter();

	async function logout() {
		await axios.post("/api/auth/logout");
		setLogin({
			userId: 1,
			username: '',
			displayname: '',
			canMakeWorkspace: false,
			thumbnail: '',
			workspaces: [],
		});
		router.push('/login');
	}

	return (
		<div className={`sticky top-0 h-full z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
			<div className="flex flex-col py-3 px-3 gap-2 focus-visible:bg-blue-200">
				<div className="flex justify-end mb-2">
					<button 
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
					>
						<IconChevronLeft 
							size={20} 
							className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
						/>
					</button>
				</div>

				<Listbox onChange={() => { }} value={workspace.groupId} as="div" className="relative inline-block w-full text-left">
					<Listbox.Button className="h-auto w-full flex flex-row rounded-xl py-1 hover:bg-gray-200 px-2 transition cursor-pointer mb-1 focus-visible:bg-gray-200">
						<div className="flex-shrink-0 w-12 h-12">
							<img
								src={workspace.groupThumbnail ? workspace.groupThumbnail : "/favicon-32x32.png"}
								alt="group name"
								className="rounded-lg w-full h-full object-contain p-1"
							/>
						</div>
						<div className={`ml-2 my-auto overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
							<span className="text-lg font-medium truncate whitespace-nowrap">{workspace.groupName}</span>
							<IconChevronDown size={18} color="#AAAAAA" className="my-auto ml-auto" />
						</div>
					</Listbox.Button>
					{!isCollapsed && (
						<Listbox.Options className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-300 focus-visible:outline-none overflow-clip">
							<div className="">
								{login?.workspaces?.map((ws, index) => (
									<Listbox.Option
										className={({ active }) =>
											`${active ? 'text-white bg-primary' : 'text-gray-900'} relative cursor-pointer select-none py-2 pl-3 pr-9`
										}
										key={index}
										value={ws.groupId}
									>
										{({ selected, active }) => (
											<>
												<div onClick={() => { router.replace(`/workspace/${ws.groupId}`).then(() => { router.reload() }) }} className="flex items-center">
													<div className="w-8 h-8 flex-shrink-0">
														<img
															src={ws.groupThumbnail}
															alt="group name"
															className="rounded-full w-full h-full object-contain"
														/>
													</div>
													<span
														className={`${selected ? 'font-semibold' : 'font-normal'} ml-2 block truncate text-xl`}
													>
														{ws.groupName}
													</span>
												</div>

												{selected ? (
													<span
														className={`${active ? 'text-white' : 'text-primary'}
																	absolute inset-y-0 right-0 flex items-center pr-4`
														}
													>
														<IconCheck className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</div>
						</Listbox.Options>
					)}
				</Listbox>
				<div className="h-[1px] rounded-xl w-full px-3 mb-1" />
				{pages.map((page, i) => (
					(page.accessible?.valueOf ? page.accessible : true) && (
						<button 
							key={i} 
							className={`h-auto flex flex-row rounded-xl py-1 px-2 transition cursor-pointer focus-visible:outline-none text-gray-700 dark:text-white hover:bg-gray-200 dark:focus-visible:bg-gray-800 ${router.pathname === page.href ? `text-primary` : ""}`} 
							tabIndex={0} 
							role="button" 
							onClick={() => gotopage(page.href)}
							title={isCollapsed ? page.name : undefined}
						>
							<div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
								<page.icon size={32} className="p-1" strokeWidth={2} />
							</div>
							<div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
								<p className="text-xl pl-2 font-medium whitespace-nowrap">
									{page.name}
								</p>
							</div>
						</button>
					)
				))}
			</div>

			<Menu as="div" className="relative inline-block w-full text-left">
				<div className="w-full">
					<Menu.Button className="h-auto flex flex-row rounded-xl py-1 hover:bg-gray-200 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800 px-2 transition cursor-pointer focus-visible:bg-gray-200 focus-visible:outline-none w-full" tabIndex={0} role="button">
						<div className="flex-shrink-0 w-12 h-12">
							<img
								src={login?.thumbnail}
								alt="image url"
								className="rounded-full w-full h-full object-contain bg-primary"
							/>
						</div>
						<div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
							<p className="text-sm pl-3 text-left whitespace-nowrap">
								Signed in as
								<br />
								<span className="font-bold">{login?.displayname}</span>
							</p>
						</div>
					</Menu.Button>
				</div>
				{!isCollapsed && (
					<Menu.Items className="absolute left-0 z-20 mt-2 bg-gray-100 w-56 origin-top-left shadow-lg ring-1 focus-visible:outline-none">
						<div className="py-1">
							<Menu.Item>
								{({ active }) => (
									<a
										className={`${active ? "bg-tovybg text-white" : "text-gray-700 dark:text-white"
											}  px-3 py-2 text-sm rounded-md m-1 mb-0 font-medium flex flex-row cursor-pointer`}
										onClick={() => router.push(`/workspace/${workspace.groupId}/profile/${login.userId}`)}
									>
										<IconUser size={22} className="inline-block" />
										<p className="ml-2"> Profile </p>
									</a>
								)}
							</Menu.Item>
							<Menu.Item>
								{({ active }) => (
									<a
										className={`${active ? "bg-tovybg text-white" : "text-gray-700 dark:text-white"
											}  px-3 py-2 text-sm rounded-md m-1 mb-0 font-medium flex flex-row cursor-pointer`}
										onClick={() => logout()}
									>
										<IconLogout size={22} className="inline-block" />
										<p className="ml-2"> Logout </p>
									</a>
								)}
							</Menu.Item>
						</div>
					</Menu.Items>
				)}
			</Menu>

			<div className={`fixed bottom-0 pl-3 pb-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
				<a className="text-gray-400 hover:underline cursor-pointer hover:text-blue-600 transition whitespace-nowrap" href="https://tovyblox.xyz">
					© Tovy 2022
				</a>
			</div>
		</div>
	);
};

export default Sidebar;
