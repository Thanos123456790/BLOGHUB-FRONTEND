// "use client";

// import Link from "next/link";

// import { useAppSelector } from "@/lib/store/hooks";
// import { formatActivity, isActiveNow } from "@/lib/format";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";
// import { useGetFollowingQuery } from "@/lib/store/api/blogifyApi";

// export function ActiveFollowersBar() {
//   const { data: followingData } = useGetFollowingQuery({ page: 0, size: 1000 });
//   const following = followingData?.content ?? [];
//   console.log("following", following);

//   const activeFollowing = following
//     .filter((u) => u.lastActiveAt)
//     .sort(
//       (a, b) =>
//         new Date(b.lastActiveAt!).getTime() - new Date(a.lastActiveAt!).getTime()
//     );

//   if (activeFollowing.length === 0) return null;

//   return (
//     <div className="mb-5">
//       <p className="text-xs font-medium text-muted-foreground mb-3 px-0.5">
//         Active in your network
//       </p>
//       <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5">
//         {activeFollowing.map((u) => {
//           const active = isActiveNow(u.lastActiveAt!);
//           return (
//             <Link
//               key={u.id}
//               href={`/u/${u.handle}`}
//               className="flex flex-col items-center gap-1.5 shrink-0 w-16 text-center group"
//             >
//               <span className="relative">
//                 <Avatar
//                   className={cn(
//                     "size-14 ring-2 transition-colors",
//                     active
//                       ? "ring-brand-amber"
//                       : "ring-border group-hover:ring-primary/40"
//                   )}
//                 >
//                   <AvatarImage src={u.avatar} alt={u.name} />
//                   <AvatarFallback>{u.name[0]}</AvatarFallback>
//                 </Avatar>
//                 {active && (
//                   <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-brand-amber ring-2 ring-card">
//                     <span className="size-1.5 rounded-full bg-brand-amber-foreground" />
//                   </span>
//                 )}
//               </span>
//               <span
//                 className={cn(
//                   "text-[10.5px] leading-tight truncate w-full",
//                   active ? "text-brand-amber font-medium" : "text-muted-foreground"
//                 )}
//               >
//                 {formatActivity(u.lastActiveAt!)}
//               </span>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }