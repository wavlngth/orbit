/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import type { LayoutProps } from "@/layoutTypes";
import axios from 'axios'
import { Transition } from "@headlessui/react";
import { IconMenu2 } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { useRouter } from "next/router";
import hexRgb from "hex-rgb";
import * as colors from 'tailwindcss/colors'
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";

const workspace: LayoutProps = ({ children }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(true);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const useTheme = (groupTheme: string) => {
		const themes: any = {
			"bg-orbit": "#FF0099",
			"bg-blue-500": colors.blue[500],
			"bg-red-500": colors.red[500],
			"bg-red-700": colors.red[700],
			"bg-green-500": colors.green[500],
			"bg-green-600": colors.green[600],
			"bg-yellow-500": colors.yellow[500],
			"bg-orange-500": colors.orange[500],
			"bg-purple-500": colors.purple[500],
			"bg-pink-500": colors.pink[500],
			"bg-black": colors.black,
			"bg-gray-500": colors.gray[500],
		}
		const hex = hexRgb(themes[groupTheme || "bg-orbit"] || "#FF0099")
		const theme = `${hex.red} ${hex.green} ${hex.blue}`
		return theme
	}

	useEffect(() => {
		router.events.on('routeChangeStart', () => {
			setLoading(true)
		});
		router.events.on('routeChangeComplete', () => {
			setLoading(false)
		});
	}, [])


	useEffect(() => {
		async function getworkspace() {
			let res;
			try {
				res = await axios.get('/api/workspace/' + router.query.id);
			} catch (e: any) {
				if (e?.response?.status === 400) {
					router.push('/')
					return;
				}
				if (e?.response?.status === 401) {
					router.push('/')
					return;
				}
				if (e?.response?.status === 404) {
					router.push('/')
					return;
				}
				return;
			}
			if (!res) return;
			//set the css var
			setWorkspace({
				...res.data.workspace,
				groupTheme: res.data.workspace.groupTheme.color,
			});
		}
		getworkspace();
	}, []);

	useEffect(() => {
		const theme = useTheme(workspace.groupTheme || 'bg-orbit')
		document.documentElement.style.setProperty('--group-theme', theme);
	}, [workspace.groupTheme]);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth < 768) {
				setOpen(false);
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Head>
				<title>{workspace.groupName || 'Loading...'}</title>
				<link rel="icon" href={`${workspace.groupThumbnail}/isCircular`} />
			</Head>

			<Transition
				show={open}
				enter="transition-opacity duration-300"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity duration-300"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className={`fixed inset-0 bg-black bg-opacity-50 z-20 ${!isMobile ? 'hidden' : ''}`} onClick={() => setOpen(false)} />
			</Transition>

			<div className="flex">
				<div className={`${isMobile ? 'fixed' : 'sticky'} top-0 z-30 h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
					<Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
				</div>

				<main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-60'}`}>
					{children}
				</main>
			</div>
		</div>
	)
}

export default workspace;
