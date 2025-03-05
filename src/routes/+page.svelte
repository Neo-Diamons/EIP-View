<script lang="ts">
	import { auth } from "$lib/stores/auth";

	import type { Project } from "$lib/types/project";

	import Input from "$lib/components/ui/input/input.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	import {
		Eye,
		Heart,
		Star,
		Banknote,
		Puzzle,
		Settings,
		Users,
		Calendar,
		Filter,
		ChevronDown,
		Check,
		Loader,
		X
	} from "lucide-svelte";

	let projects = $state<Project[]>([]);
	let cities = $derived.by(() => {
		const cities = projects.map((project) => project.ownerCity.name);
		return Array.from(new Set(cities)).sort();
	});
	let loadingProjects = $state(false);
	let filteredYear = $state<string>((new Date().getFullYear() - 1).toString());
	let filteredName = $state<string>("");
	let filteredStatus = $state<string[]>([]);
	let filteredTypes = $state<string[]>([]);
	let filteredCities = $state<string[]>([]);

	function filterProjects(projects: Project[], filteredName: string, filteredStatus: string[]) {
		return projects.filter((project) => {
			const nameValid = project.name.toLowerCase().includes(filteredName);
			const statusValid = filteredStatus.length === 0 || filteredStatus.includes(project.status);
			const typeValid = filteredTypes.length === 0 || filteredTypes.includes(project.envisagedType);
			const cityValid =
				filteredCities.length === 0 || filteredCities.includes(project.ownerCity.name);

			return nameValid && statusValid && typeValid && cityValid;
		});
	}

	async function fetchProjects(bearer: string, filteredYear: string) {
		if (!bearer) return;
		loadingProjects = true;
		const response = await fetch(
			"https://eip.epitech.eu/api/projects" +
				`?scholar_year=${filteredYear}` +
				"&user_projects=false" +
				"&starred_projects=false" +
				"&offset=0" +
				"&include_rejected=true",
			{
				headers: {
					accept: "application/json",
					authorization: `Bearer ${bearer}`
				}
			}
		);
		const data = await response.json();

		if (Array.isArray(data.results)) {
			projects = data.results;
		}
		loadingProjects = false;
	}

	async function fetchLogo(id: number) {
		if (!$auth) return;
		const response = await fetch(`https://eip.epitech.eu/api/projects/${id}/logo`, {
			headers: {
				accept: "text/plain",
				authorization: `Bearer ${$auth}`
			}
		});
		return await response.text();
	}

	async function fetchAvatar(email: string) {
		if (!$auth) return;
		const response = await fetch(`https://eip.epitech.eu/api/users/${email}/avatar`, {
			headers: {
				accept: "image/*",
				authorization: `Bearer ${$auth}`
			}
		});
		const blob = await response.blob();
		return URL.createObjectURL(blob);
	}

	$effect(() => {
		fetchProjects($auth, filteredYear);
	});
</script>

<svelte:head>
	<title>EIP - Projects {filteredYear}</title>
</svelte:head>

<div class="container mx-auto flex flex-col gap-4 p-4">
	<Input type="text" placeholder="Bearer token" bind:value={$auth} />
	<div class="flex flex-row items-center gap-4">
		<Input type="text" placeholder="Search for a project" bind:value={filteredName} />
		<Select.Root type="single" name="favoriteFruit" bind:value={filteredYear}>
			<Select.Trigger class="w-[180px]">
				<Calendar class="size-4" />
				{filteredYear}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.GroupHeading>Years</Select.GroupHeading>
					{#each Array.from( { length: new Date().getFullYear() - 2023 }, (_, i) => (2023 + i).toString() ) as year (year)}
						<Select.Item value={year} label={year}>{year}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: "outline" })}>
				<Filter class="size-4" />
				Filter by
				<ChevronDown class="size-4 opacity-50" />
			</Popover.Trigger>
			<Popover.Content class="flex flex-col gap-4">
				<Label for="status">Status</Label>
				<div class="flex flex-col gap-2">
					{#each ["approved", "pending", "rejected"] as status (status)}
						<div class="flex flex-row items-center gap-2">
							<Checkbox
								id={status}
								checked={filteredStatus.includes(status)}
								value={status}
								onCheckedChange={(value: boolean) => {
									if (value) {
										filteredStatus.push(status);
									} else {
										filteredStatus = filteredStatus.filter((s) => s !== status);
									}
								}}
							/>
							<Label for={status} class="capitalize">{status}</Label>
						</div>
					{/each}
				</div>
				<Label for="types">Types</Label>
				<div class="flex flex-col gap-2">
					{#each ["solution", "entrepreneurship", "technical"] as type (type)}
						<div class="flex flex-row items-center gap-2">
							<Checkbox
								id={type}
								checked={filteredTypes.includes(type)}
								value={type}
								onCheckedChange={(value: boolean) => {
									if (value) {
										filteredTypes.push(type);
									} else {
										filteredTypes = filteredTypes.filter((t) => t !== type);
									}
								}}
							/>
							<Label for={type} class="capitalize">{type}</Label>
						</div>
					{/each}
				</div>
				<Label for="cities">Cities</Label>
				<ScrollArea class="h-25">
					<div class="flex flex-col gap-2">
						{#each cities as city (city)}
							<div class="flex flex-row items-center gap-2">
								<Checkbox
									id={city}
									checked={filteredCities.includes(city)}
									value={city}
									onCheckedChange={(value: boolean) => {
										if (value) {
											filteredCities.push(city);
										} else {
											filteredCities = filteredCities.filter((c) => c !== city);
										}
									}}
								/>
								<Label for={city} class="capitalize">{city}</Label>
							</div>
						{/each}
					</div>
				</ScrollArea>
			</Popover.Content>
		</Popover.Root>
	</div>

	{#if loadingProjects}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<Skeleton class="h-95 w-full" />
			<Skeleton class="h-95 w-full" />
			<Skeleton class="hidden h-95 w-full md:block" />
			<Skeleton class="hidden h-95 w-full md:block" />
			<Skeleton class="hidden h-95 w-full xl:block" />
			<Skeleton class="hidden h-95 w-full xl:block" />
		</div>
	{:else if projects.length === 0}
		<div class="flex h-[80vh] flex-col items-center justify-center gap-4">
			<p class="text-center">No projects found</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filterProjects(projects, filteredName, filteredStatus) as project (project.id)}
				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div class="flex flex-row items-center gap-2 overflow-hidden">
							<Avatar.Root class="rounded-sm">
								{#if project.logoUploaded}
									{#await fetchLogo(project.id) then url}
										<Avatar.Image src={url} alt={project.name} />
									{/await}
								{/if}
								<Avatar.Fallback class="capitalize">{project.name[0]}</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<Card.Title class="text-elipsis overflow-hidden text-nowrap">
									{project.name}
								</Card.Title>
								<Card.Description>{project.ownerCity.name}</Card.Description>
							</div>
						</div>
						{#if project.status === "approved"}
							<div
								class="
							text-primary-foreground inline-flex h-7 items-center justify-center gap-2 rounded-md bg-green-600 px-2 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<Check class="size-4" />
								Approved
							</div>
						{:else if project.status === "pending"}
							<div
								class="
							text-primary-foreground inline-flex h-7 items-center justify-center gap-2 rounded-md bg-yellow-400 px-2 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<Loader class="size-4" />
								Pending
							</div>
						{:else if project.status === "rejected"}
							<div
								class="
							text-primary-foreground inline-flex h-7 items-center justify-center gap-2 rounded-md bg-red-600 px-2 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<X class="size-4" />
								Rejected
							</div>
						{/if}
					</Card.Header>
					<Card.Content class="text-elipsis flex h-50 flex-col gap-4 overflow-hidden">
						<div class="flex flex-wrap gap-2">
							{#if project.lookingForMembers}
								<Badge class="flex items-center gap-2 bg-yellow-100 text-nowrap text-yellow-400">
									<Users class="size-4" />
									Looking for members
								</Badge>
							{/if}
							{#each project.tags as tag (tag.id)}
								<Badge style={`background-color: ${tag.color};`} class="text-nowrap text-white">
									#{tag.label}
								</Badge>
							{/each}
						</div>
						<div class="line-clamp-3">
							{project.description}
						</div>
					</Card.Content>
					<Card.Footer class="flex flex-row items-end justify-between gap-2">
						<div class="flex flex-col items-start gap-2">
							<div class="flex flex-wrap gap-2">
								{#each project.members as member (member.login)}
									<Avatar.Root class="">
										{#await fetchAvatar(member.login) then url}
											<Avatar.Image src={url} alt={member.login} />
										{/await}
										<Avatar.Fallback class="capitalize">
											{member.firstname[0]}{member.lastname[0]}
										</Avatar.Fallback>
									</Avatar.Root>
								{/each}
							</div>
							<div class="flex flex-wrap gap-2">
								<div
									class="
								text-primary-foreground inline-flex h-7 items-center justify-center gap-2 rounded-md bg-zinc-700 px-2 text-xs font-medium whitespace-nowrap transition-colors
								[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
							"
								>
									<Eye class="size-4" />
									{project.totalViews}
								</div>
								<Button size="xs" class="bg-red-600">
									{#if project.starred}
										<Heart class="size-4 fill-white" />
									{:else}
										<Heart class="size-4" />
									{/if}
									{project.totalStars}
								</Button>
								{#if project.averageMark > 0}
									<Button size="xs" class="bg-yellow-400">
										<Star class="size-4" />
										{project.averageMark} / 5
									</Button>
								{/if}
							</div>
						</div>
						{#if project.envisagedType === "solution"}
							<div
								class="
							text-primary-foreground inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sky-600 px-8 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<Puzzle class="size-4" />
								Solution
							</div>
						{:else if project.envisagedType === "entrepreneurship"}
							<div
								class="
							text-primary-foreground inline-flex h-11 items-center justify-center gap-2 rounded-md bg-lime-600 px-8 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<Banknote class="size-4" />
								Entrepreneurship
							</div>
						{:else if project.envisagedType === "technical"}
							<div
								class="
							text-primary-foreground inline-flex h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-8 text-xs font-medium whitespace-nowrap transition-colors
							[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
						"
							>
								<Settings class="size-4" />
								Technical
							</div>
						{/if}
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
