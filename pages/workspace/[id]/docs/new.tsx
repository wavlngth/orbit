import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Button from "@/components/button";
import Input from "@/components/input";
import Workspace from "@/layouts/workspace";
import { useRecoilState } from "recoil";
import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { IconCheck, IconChevronDown, IconH1, IconH2, IconH3, IconH4, IconBold, IconItalic, IconListDetails, IconArrowLeft, IconLock } from "@tabler/icons";
import { useRouter } from "next/router";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import axios from "axios";
import prisma from "@/utils/database";
import { useForm, FormProvider } from "react-hook-form";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import clsx from 'clsx';

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async (context) => {
	const { id } = context.query;

	const roles = await prisma.role.findMany({
		where: {
			workspaceGroupId: Number(id),
			isOwnerRole: false
		},
	});


	return {
		props: {
			roles
		},
	};

}, 'manage_docs');

const Home: pageWithLayout<InferGetServerSidePropsType<GetServerSideProps>> = ({ roles }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const router = useRouter();
	const form = useForm();

	const editor = useEditor({
		extensions: [
			StarterKit,
		],
		editorProps: {
			attributes: {
				class: 'prose dark:prose-invert max-w-none focus:outline-none',
			},
		},
		content: '',
	});

	const goback = () => {
		window.history.back();
	}

	const createDoc = async () => {
		const session = await axios.post(`/api/workspace/${workspace.groupId}/guides/create`, {
			name: form.getValues().name,
			content: editor?.getJSON(),
			roles: selectedRoles
		}).catch(err => {
			form.setError("name", { type: "custom", message: err.response.data.error })
		});
		if (!session) return;
		form.clearErrors()
		router.push(`/workspace/${workspace.groupId}/docs/${session.data.document.id}`)
	}

	const toggleRole = async (role: string) => {
		const roles = selectedRoles;
		if (roles.includes(role)) {
			roles.splice(roles.indexOf(role), 1);
		}
		else {
			roles.push(role);
		}
		setSelectedRoles(roles);
	}

	const buttons = {
		heading: [
			{
				icon: IconH1,
				function: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
				active: () => editor?.isActive('heading', { level: 1 }),
			},
			{
				icon: IconH2,
				function: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
				active: () => editor?.isActive('heading', { level: 2 }),
			},
			{
				icon: IconH3,
				function: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
				active: () => editor?.isActive('heading', { level: 3 }),
			},
			{
				icon: IconH4,
				function: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
				active: () => editor?.isActive('heading', { level: 4 }),
			},
		],
		util: [
			{
				icon: IconBold,
				function: () => editor?.chain().focus().toggleBold().run(),
				active: () => editor?.isActive('bold'),
			},
			{
				icon: IconItalic,
				function: () => editor?.chain().focus().toggleItalic().run(),
				active: () => editor?.isActive('italic'),
			},
		],
		list: [
			{
				icon: IconListDetails,
				function: () => editor?.chain().focus().toggleBulletList().run(),
				active: () => editor?.isActive('bulletList'),
			},
		]
	}

	return (
		<div className="pagePadding">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-4 mb-6">
						<button
							onClick={goback}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<IconArrowLeft className="w-5 h-5 text-gray-500" />
						</button>
						<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
							New Document
						</h1>
					</div>
					<p className="text-gray-500">
						Create a new document for your workspace
					</p>
				</div>

				<FormProvider {...form}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
						{/* Document Info */}
						<div className="lg:col-span-2">
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
									Document Information
								</h2>
								<Input 
									{...form.register('name', { 
										required: { value: true, message: "Document name is required" } 
									})} 
									label="Document Name" 
								/>
							</div>
						</div>

						{/* Permissions */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
									Permissions
								</h2>
								<div className="space-y-3">
									{roles.map((role: any) => (
										<label
											key={role.id}
											className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
										>
											<input
												type="checkbox"
												checked={selectedRoles.includes(role.id)}
												onChange={() => toggleRole(role.id)}
												className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
											/>
											<span className="text-gray-700 dark:text-gray-200">
												{role.name}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Editor Toolbar */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
						<div className="flex flex-wrap gap-2">
							{Object.values(buttons).map((group, index) => (
								<div key={index} className="flex gap-1">
									{group.map((button, buttonIndex) => (
										<button
											key={buttonIndex}
											onClick={button.function}
											className={clsx(
												'p-2 rounded-lg transition-colors',
												button.active()
													? 'bg-primary text-white'
													: 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
											)}
										>
											<button.icon className="w-5 h-5" />
										</button>
									))}
								</div>
							))}
						</div>
					</div>

					{/* Editor Content */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
						<EditorContent editor={editor} />
					</div>

					{/* Actions */}
					<div className="flex items-center gap-4">
						<button
							onClick={goback}
							className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={form.handleSubmit(createDoc)}
							className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
						>
							<IconCheck className="w-4 h-4" />
							Create Document
						</button>
					</div>
				</FormProvider>
			</div>
		</div>
	);
};

Home.layout = Workspace;

export default Home;
