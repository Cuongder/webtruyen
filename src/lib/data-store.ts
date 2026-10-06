import { slugify } from "./utils";

export interface StoryItem {
  id: string;
  title: string;
  slug: string;
  authorId: string;
  authorName: string;
  authorPenName: string;
  authorAvatar: string;
  coverUrl: string;
  shortDescription: string;
  fullDescription: string;
  status: "ONGOING" | "COMPLETED" | "DRAFT";
  genres: string[];
  tags: string[];
  viewsCount: number;
  followersCount: number;
  ratingScore: number;
  ratingsCount: number;
  totalChapters: number;
  wordCount: number;
  featured?: boolean;
  trendingRank?: number;
  updatedAt: string;
}

export interface ChapterItem {
  id: string;
  storyId: string;
  storySlug: string;
  chapterNumber: number;
  title: string;
  slug: string;
  content: string;
  wordCount: number;
  publishedAt: string;
}

export interface CommentItem {
  id: string;
  storyId: string;
  chapterId?: string;
  authorName: string;
  authorAvatar: string;
  isAuthor?: boolean;
  content: string;
  likes: number;
  createdAt: string;
  replies?: CommentItem[];
}

export interface GenreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

const globalData = globalThis as unknown as {
  __MOCTHU_GENRES?: GenreItem[];
  __MOCTHU_STORIES?: StoryItem[];
  __MOCTHU_CHAPTERS?: Record<string, ChapterItem[]>;
  __MOCTHU_BADGES?: BadgeItem[];
  __MOCTHU_USERS?: UserItem[];
  __MOCTHU_AUDIT_LOGS?: AuditLogItem[];
};

const INITIAL_GENRES_DATA: GenreItem[] = [
  { id: "tien-hiep", name: "Tiên Hiệp", slug: "tien-hiep", description: "Hành trình tu chân ngộ đạo, nghịch thiên cải mệnh vượt qua lôi kiếp trường sinh.", count: 24 },
  { id: "huyen-huyen", name: "Huyền Huyễn", slug: "huyen-huyen", description: "Thế giới dị giới bao la, ma pháp, đấu khí và các chủng tộc viễn cổ huyền bí.", count: 18 },
  { id: "kiem-hiep", name: "Kiếm Hiệp", slug: "kiem-hiep", description: "Ân oán giang hồ, kiếm ý vô song, hiệp nghĩa trường tồn giữa phong ba loạn lạc.", count: 15 },
  { id: "do-thi", name: "Đô Thị", slug: "do-thi", description: "Bối cảnh hiện đại, thương trường, y thuật và nhân sinh hào môn đặc sắc.", count: 12 },
  { id: "ngon-tinh", name: "Ngôn Tình", slug: "ngon-tinh", description: "Những câu chuyện tình yêu sâu lắng, dịu dàng, vượt qua trắc trở thời gian.", count: 20 },
  { id: "trinh-tham", name: "Trinh Thám", slug: "trinh-tham", description: "Phá án ly kỳ, đấu trí nghẹt thở, vén màn bí mật ẩn giấu sau những bức màn nhung.", count: 9 },
  { id: "khoa-huyen", name: "Khoa Huyễn", slug: "khoa-huyen", description: "Du hành tinh tế, công nghệ tương lai, nền văn minh vũ trụ và cơ giáp chiến tranh.", count: 8 },
  { id: "lich-su", name: "Lịch Sử", slug: "lich-su", description: "Xuyên không dĩ vãng, chiến lược bình thiên hạ, phục hưng sơn hà gấm vóc.", count: 11 },
];
export const GENRES_DATA: GenreItem[] =
  globalData.__MOCTHU_GENRES ?? (globalData.__MOCTHU_GENRES = INITIAL_GENRES_DATA);

const INITIAL_STORIES_DATA: StoryItem[] = [
  {
    id: "story-1",
    title: "Trường Khách Sơn Hà",
    slug: "truong-khach-son-ha",
    authorId: "author-1",
    authorName: "Cố Niệm Vũ",
    authorPenName: "Cố Niệm Vũ",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Dưới bóng tùng cổ thụ ngàn năm, thanh kiếm rỉ sét cất lên tiếng thở dài của tiền kiếp. Một kiếm chém tan mây mù, mở ra con đường tu đạo cô độc giữa sơn hà tráng lệ.",
    fullDescription: "Đời trước, Lý Vô Trần dốc lòng vì tông môn, vì sư đồ mà cả đời chinh chiến, đổi lại là chén rượu độc và sự phản bội của người chí thân. Trùng sinh trở lại lúc niên thiếu khi vạn sự chưa thành, hắn ôm theo kiếm phổ vô danh cùng tâm cảnh tịch diệt. Sơn hà vạn dặm, yêu ma loạn thế, ai là khách qua đường, ai là kẻ định đoạt luân hồi? Một tác phẩm tiên hiệp cổ phong mang văn phong trầm lắng, câu chữ gọt giũa tỉ mỉ, khắc họa rõ nét nhân sinh cùng kiếm đạo chân chính.",
    status: "ONGOING",
    genres: ["Tiên Hiệp", "Trọng Sinh", "Kiếm Hiệp"],
    tags: ["Kiếm Đạo", "Trọng Sinh", "Cổ Phong", "Điềm Đạm", "Đỉnh Phong"],
    viewsCount: 1240000,
    followersCount: 38400,
    ratingScore: 4.95,
    ratingsCount: 2310,
    totalChapters: 142,
    wordCount: 852000,
    featured: true,
    trendingRank: 1,
    updatedAt: "2026-10-04T08:30:00Z",
  },
  {
    id: "story-2",
    title: "Thiên Đạo Đồ Thư",
    slug: "thien-dao-do-thu",
    authorId: "author-2",
    authorName: "Mặc Bạch",
    authorPenName: "Mặc Bạch",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Tàng thư các dưới lòng đất lưu giữ nghìn vạn tàn thư từ thời thái cổ. Mỗi trang sách mở ra là một bí cảnh hoang sơ đã chìm vào quên lãng.",
    fullDescription: "Trần Mặc chỉ là một tiểu lại thủ thư trông coi điển tịch tại hoàng thành cổ. Tình cờ phát hiện ra một pho sách cũ không có chữ, chỉ khi nhỏ giọt máu đầu ngón tay mới hiện lên từng hàng chữ vàng rực rỡ ghi chép toàn bộ khiếm khuyết của vạn vật trên đời. Từ một phàm nhân thể chất suy nhược, hắn từng bước chỉ điểm thiên hạ, sửa sai bí kíp của các đại tông môn, dạo bước qua ngàn năm dâu bể.",
    status: "ONGOING",
    genres: ["Huyền Huyễn", "Tiên Hiệp"],
    tags: ["Trí Tuệ", "Vô Địch", "Đồ Thư Các", "Cơ Duyên"],
    viewsCount: 950000,
    followersCount: 29100,
    ratingScore: 4.88,
    ratingsCount: 1820,
    totalChapters: 98,
    wordCount: 588000,
    featured: true,
    trendingRank: 2,
    updatedAt: "2026-10-03T19:15:00Z",
  },
  {
    id: "story-3",
    title: "Cửu Tinh Vô Cực",
    slug: "cuu-tinh-vo-cuc",
    authorId: "author-3",
    authorName: "Thanh Phong Tán Nhân",
    authorPenName: "Thanh Phong",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Trời có cửu thiên, tinh tú có chín cực. Hấp thu tinh hoa nhật nguyệt, đúc nên vĩnh hằng bất diệt thân thể giữa thời loạn.",
    fullDescription: "Thời viễn cổ, đại kiếp giáng lâm hủy diệt chín tinh vực vĩ đại. Hàng ức năm sau, thiếu niên Diệp Phong từ một bộ lạc hoang dã tìm được mảnh vỡ của Tinh Hạch Vĩnh Hằng. Mỗi một vì sao thắp sáng trong đan điền là một lần lột xác đoạt thiên địa tạo hóa.",
    status: "ONGOING",
    genres: ["Huyền Huyễn", "Khoa Huyễn"],
    tags: ["Nhiệt Huyết", "Thăng Cấp", "Tinh Không", "Đại Chiến"],
    viewsCount: 780000,
    followersCount: 21500,
    ratingScore: 4.82,
    ratingsCount: 1420,
    totalChapters: 120,
    wordCount: 720000,
    trendingRank: 3,
    updatedAt: "2026-10-03T14:20:00Z",
  },
  {
    id: "story-4",
    title: "Sương Khói Cố Đô",
    slug: "suong-khoi-co-do",
    authorId: "author-1",
    authorName: "Cố Niệm Vũ",
    authorPenName: "Cố Niệm Vũ",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Gió heo may thổi qua những mái ngói rêu phong đất Thần Kinh. Một khúc ca ân oán triều đình xen lẫn mối tình dang dở bên dòng sông Hương.",
    fullDescription: "Lấy bối cảnh triều đại hư cấu mang dáng dấp thời kỳ phong kiến Việt Nam xưa. Nàng là con gái quan ngự sử chính trực, chàng là vương gia mang trong mình mối thù thâm cung. Đêm kinh thành chìm trong khói lửa binh biến, một lời hẹn ước thuở thanh mai trúc mã liệu có thắng nổi bánh xe quyền lực?",
    status: "COMPLETED",
    genres: ["Lịch Sử", "Ngôn Tình"],
    tags: ["Cung Đấu", "Cổ Phong Việt", "Ân Oán", "Hoàn Thành"],
    viewsCount: 620000,
    followersCount: 18900,
    ratingScore: 4.92,
    ratingsCount: 1650,
    totalChapters: 76,
    wordCount: 456000,
    featured: true,
    trendingRank: 4,
    updatedAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "story-5",
    title: "Án Mạng Trong Hẻm Sương Mù",
    slug: "an-mang-trong-hem-suong-mu",
    authorId: "author-4",
    authorName: "Vũ Bằng",
    authorPenName: "Mộc Thư Đình",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Một chuỗi các vụ án kỳ dị diễn ra vào những đêm trăng tròn mờ sương. Thanh tra Hoàng cùng trợ lý bước vào cuộc đấu trí sinh tử với kẻ sát nhân bóng đêm.",
    fullDescription: "Mỗi hiện trường để lại duy nhất một nhánh hoa lưu ly bằng sáp cùng một dòng chữ cổ bằng mực tím. Khi sự thật dần lộ diện, thanh tra nhận ra những người bị hại năm xưa từng cùng thề nguyện trong một bí mật khủng khiếp thời chiến tranh.",
    status: "ONGOING",
    genres: ["Trinh Thám", "Đô Thị"],
    tags: ["Phá Án", "Hồi Hộp", "Tâm Lý Tội Phạm", "Hiện Đại"],
    viewsCount: 430000,
    followersCount: 14200,
    ratingScore: 4.79,
    ratingsCount: 980,
    totalChapters: 45,
    wordCount: 270000,
    trendingRank: 5,
    updatedAt: "2026-10-03T18:45:00Z",
  },
  {
    id: "story-6",
    title: "Tiệm Sách Lúc Nửa Đêm",
    slug: "tiem-sach-luc-nua-dem",
    authorId: "author-5",
    authorName: "An Chi",
    authorPenName: "An Chi",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Tiệm sách chỉ mở cửa từ mười hai giờ đêm đến tờ mờ sáng. Nơi mỗi vị khách có thể đổi một ký ức sâu đậm lấy một quyển sách giải đáp tương lai.",
    fullDescription: "Ghé chân vào tiệm sách cổ kính nằm sâu trong con ngõ nhỏ của phố cổ Hà Nội, người ta bắt gặp mùi giấy mới hòa lẫn hương trà hoa cúc thoang thoảng. Chủ tiệm là một thanh niên trầm mặc với đôi mắt tựa như đã nhìn thấu hồng trần nhân thế.",
    status: "ONGOING",
    genres: ["Đô Thị", "Huyền Huyễn", "Ngôn Tình"],
    tags: ["Chữa Lành", "Hơi Thở Cuộc Sống", "Kỳ Bí", "Ấm Áp"],
    viewsCount: 510000,
    followersCount: 16800,
    ratingScore: 4.96,
    ratingsCount: 1540,
    totalChapters: 54,
    wordCount: 324000,
    updatedAt: "2026-10-04T07:10:00Z",
  },
];
export const STORIES_DATA: StoryItem[] =
  globalData.__MOCTHU_STORIES ?? (globalData.__MOCTHU_STORIES = INITIAL_STORIES_DATA);

const INITIAL_CHAPTERS_DATA: Record<string, ChapterItem[]> = {
  "truong-khach-son-ha": [
    {
      id: "ch-1",
      storyId: "story-1",
      storySlug: "truong-khach-son-ha",
      chapterNumber: 1,
      title: "Chương 1: Kiếm gỉ dưới tàng tùng",
      slug: "chuong-1-kiem-gi-duoi-tang-tung",
      wordCount: 2450,
      publishedAt: "2026-09-01T00:00:00Z",
      content: `Dưới bóng tùng cổ thụ ngàn năm trên đỉnh Thương Ngô, sương sớm tựa như dải lụa bạc mỏng manh lững lờ trôi qua những kẽ lá kim sắc nhọn.

Gió núi buốt giá rít qua vách đá hoa cương dựng đứng, mang theo mùi ẩm mốc của cỏ mục và hương nhựa thông nồng đượm. Trên một mỏm đá nhô ra giữa biển mây mênh mông, một thiếu niên mặc áo vải thô màu chàm đang ngồi xếp bằng, lưng thẳng như một ngọn giáo cắm sâu vào lòng đất.

Hắn là Lý Vô Trần.

Trước mặt hắn, cắm nghiêng vào khe nứt của đá tảng là một thanh kiếm cũ kỹ, rỉ sét loang lổ khắp thân kiếm đến mức không còn nhận ra được sắc thép nguyên bản. Thế nhưng, nếu có một vị kiếm tu đắc đạo tình cờ đi ngang qua đây, ắt hẳn sẽ kinh hãi nhận thấy: từng giọt sương rơi xuống gần thanh kiếm đều vô thanh vô tức bị chém làm đôi trước khi kịp chạm vào mặt đất.

Lý Vô Trần mở mắt.

Đôi mắt hắn sâu thẳm tựa như giếng cổ ngàn năm không gợn sóng, hoàn toàn không tương xứng với gương mặt còn vương nét non nớt của tuổi mười sáu.

"Một giấc mộng trăm năm... hay thật sự ta đã sống lại một đời?"

Hắn khẽ lẩm bẩm, thanh âm trầm thấp hòa vào tiếng gió rít. Ký ức cuối cùng của hắn ở kiếp trước là chén ngự tửu lạnh buốt nơi Thiên Kiếm Điện, là ánh mắt lạnh lùng của sư phụ và nụ cười đắc ý của vị sư đệ mà hắn từng coi như ruột thịt. Trăm năm chinh chiến vì tông môn, chém yêu diệt ma bảo hộ nhân gian, cuối cùng lại đổi lấy bốn chữ "công cao lấn chủ".

Hắn đưa bàn tay gầy gò vuốt nhẹ lên chuôi kiếm gỉ. Một luồng hàn khí quen thuộc từ chuôi kiếm truyền thẳng vào tâm can, khiến từng đường kinh mạch trong cơ thể hắn khẽ rung lên.

"Nếu trời đã cho ta trùng sinh trở lại lúc niên thiếu, thì con đường kiếm đạo này, ta sẽ vì chính mình mà đi. Sơn hà vạn dặm, yêu ma loạn thế, ai là kiếm khách qua đường, ai là kẻ định đoạt luân hồi?"

Dứt lời, Lý Vô Trần đứng dậy, vung tay rút mạnh thanh kiếm khỏi khe đá. Tiếng kiếm ngân vang vọng rền rĩ cả một vùng trời mây, tựa như rồng thiêng thức giấc sau giấc ngủ vùi ngàn năm.`,
    },
    {
      id: "ch-2",
      storyId: "story-1",
      storySlug: "truong-khach-son-ha",
      chapterNumber: 2,
      title: "Chương 2: Đạo tâm như sắt, bước vào hồng trần",
      slug: "chuong-2-dao-tam-nhu-sat-buoc-vao-hong-tran",
      wordCount: 2680,
      publishedAt: "2026-09-03T00:00:00Z",
      content: `Men theo con đường mòn cheo leo nơi vách núi hiểm trở, Lý Vô Trần vững vàng từng bước hạ sơn.

Dưới chân Thương Ngô sơn là trấn Thanh Khê, một thị trấn sầm uất quy tụ đông đảo thương nhân, thợ săn yêu thú và đệ tử ngoại môn của các tông phái lân cận. Khói bếp ban mai lãng đãng quyện cùng tiếng rao hàng huyên náo, hơi thở phàm trần ùa về ngập tràn các giác quan.

Kiếp trước, hắn vừa xuống núi đã vội vã tham gia khảo hạch của Huyền Kiếm Tông, để rồi bước chân vào vũng lầy ân oán không lối thoát. Kiếp này, mục đích của hắn hoàn toàn khác.

Hắn bước vào một quán trà nhỏ ven sông. Tiếng nước sôi sùng sục trong ấm đất nung, mùi trà xanh chát ngọt dịu dàng lan tỏa.

"Tiểu nhị, cho một ấm trà Long Tỉnh cùng ba cái bánh bao nóng."

"Có ngay thưa khách quan!" Tiếng đáp lanh lảnh của tiểu nhị vang lên.

Bên bàn đối diện, bốn gã đại hán lưng đeo đao lớn, mặt mày hung hãn đang vừa uống rượu vừa lớn tiếng bàn tán:
"Các ngươi đã nghe tin gì chưa? Trong đầm lầy Vạn Độc ở Hắc Phong Lĩnh đêm qua có dị tượng phát ra! Một đạo kiếm quang màu tím xông thẳng lên mây, có kẻ đồn rằng đó là di tích của Tử Kiếm Thượng Nhân lưu lại từ ba trăm năm trước!"

Lý Vô Trần khẽ nhấp một ngụm trà nóng, khóe môi thoáng hiện một nụ cười kín đáo.

Tử Kiếm Thượng Nhân? Đâu phải là bảo vật gì, đó rõ ràng là sào huyệt của một con Hắc Huyết Mãng độ kiếp thất bại, phóng thích độc chướng hấp dẫn kiếm tu đến làm mồi tẩm bổ. Đời trước có không dưới trăm tên đệ tử tông môn đã bỏ mạng trong vụ này.

"Muốn rèn giũa kiếm ý chí cương chí thuần, Hắc Phong Lĩnh quả nhiên là một nơi thích hợp..."`,
    },
    {
      id: "ch-3",
      storyId: "story-1",
      storySlug: "truong-khach-son-ha",
      chapterNumber: 3,
      title: "Chương 3: Kiếm ý sơ hiển, chấn nhiếp quần hùng",
      slug: "chuong-3-kiem-y-so-hien-chan-nhiep-quan-hung",
      wordCount: 2890,
      publishedAt: "2026-09-06T00:00:00Z",
      content: `Rời khỏi trấn Thanh Khê, sắc trời dần ngả về chiều tà. Ráng đỏ như máu nhuộm thẫm từng rặng mây phía tây, báo hiệu một đêm không hề yên ả.

Đường vào Hắc Phong Lĩnh càng lúc càng âm u rậm rạp. Cổ thụ cao chọc trời đan xen chằng chịt những cành khô lá mục, dưới chân là lớp sình lầy bốc lên mùi hôi thối nồng nặc.

"Keng!"

Một tiếng đao kiếm va chạm sắc lạnh vang lên phía trước bụi rậm, kèm theo tiếng quát tháo dữ dội:
"Khốn kiếp! Tiện nhân kia, ngoan ngoãn giao tấm da thú ghi bản đồ địa huyệt ra, lão tử sẽ cho ngươi chết thanh thản!"

Lý Vô Trần dừng bước, lẳng lặng nhìn qua khe lá.

Giữa khoảng đất trống, ba tên tu sĩ mặc hắc bào của Huyết Sát Môn đang vây công một thiếu nữ áo trắng nhuốm máu. Nàng tóc tai rối bời, một tay ôm vai trái đang chảy máu xối xả, thanh nhuyễn kiếm trong tay run rẩy nhưng ánh mắt vẫn ngập tràn vẻ bất khuất kiên cường.

"Hừ, đệ tử Huyết Sát Môn chỉ biết ỷ đông hiếp yếu, có giỏi thì một đấu một với bổn cô nương!"

"Một đấu một? Nực cười! Tu chân giới thực lực vi tôn, người chết thì không có quyền đàm đạo đạo lý!" Tên cầm đầu cười gằn, lưỡi quỷ đầu đao trong tay hắn lóe lên ánh sáng đỏ lòm tanh tưởi, hung hãn chém xuống đỉnh đầu thiếu nữ.

Ngay tại thời khắc ngàn cân treo sợi tóc, một tiếng xé gió nhẹ như lông hồng lướt qua tai mọi người.

"Vút!"

Thanh kiếm gỉ trong tay Lý Vô Trần rời vỏ.

Không có linh lực cuồn cuộn long trời lở đất, không có hào quang chói lòa kinh thế hãi tục, chỉ là một đường kiếm thẳng tắp, tự nhiên và chuẩn xác đến rợn người, tựa như một nét bút lông quệt ngang tờ giấy trắng.

"Xoẹt!"

Lưỡi quỷ đầu đao gãy đôi rơi cắm phập xuống đất. Tên đầu lĩnh Huyết Sát Môn cứng đờ cả người, trừng to hai mắt nhìn một vết máu mảnh như sợi chỉ vừa xuất hiện ngang cổ họng mình trước khi ngã gục xuống bùn lầy.

Hai tên còn lại hoảng hốt lùi lại ba bước, run rẩy nhìn thiếu niên áo chàm vừa từ bóng tối bước ra:
"Ngươi... ngươi là ai?!"

Lý Vô Trần không nhìn chúng, chỉ nhẹ nhàng lau vết máu trên thân kiếm:
"Người qua đường mượn lối."`,
    },
  ],
};
export const CHAPTERS_DATA: Record<string, ChapterItem[]> =
  globalData.__MOCTHU_CHAPTERS ?? (globalData.__MOCTHU_CHAPTERS = INITIAL_CHAPTERS_DATA);

export const COMMENTS_DATA: Record<string, CommentItem[]> = {
  "truong-khach-son-ha": [
    {
      id: "cm-1",
      storyId: "story-1",
      authorName: "Mặc Khách Giang Hồ",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      content: "Lâu lắm rồi mới đọc được một bộ tiên hiệp cổ phong văn phong trầm ấm, câu từ gọt giũa như thế này! Tác giả viết kiếm ý rất có hồn, không bị chạy theo lối mì ăn liền thăng cấp vô lý. Đề cử mạnh mẽ!",
      likes: 48,
      createdAt: "2026-10-02T15:20:00Z",
      replies: [
        {
          id: "cm-1-1",
          storyId: "story-1",
          authorName: "Cố Niệm Vũ",
          authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          isAuthor: true,
          content: "Cảm ơn đạo hữu đã kiên nhẫn đồng hành cùng câu chữ của Mộc Thư. Chương tiếp theo sẽ có nhiều nút thắt kiếm đạo được hé lộ!",
          likes: 24,
          createdAt: "2026-10-02T16:05:00Z",
        },
      ],
    },
    {
      id: "cm-2",
      storyId: "story-1",
      authorName: "Thanh Trà Thiếu Nữ",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      content: "Giao diện đọc ban đêm của Mộc Thư màu ấm cực kỳ dịu mắt, nằm đọc suốt 2 tiếng không thấy chói tí nào. Tác giả ra chương đều đặn nhé!",
      likes: 31,
      createdAt: "2026-10-03T21:10:00Z",
    },
  ],
};

// ================= USER & BADGE DATA =================

export interface UserItem {
  id: string;
  email: string;
  username: string;
  name: string;
  role: "GUEST" | "READER" | "AUTHOR" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  banReason?: string;
  bannedAt?: string;
  penName?: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
  badges: string[]; // Badge IDs
  readingStats?: {
    hoursRead: number;
    wordsRead: number;
    chaptersRead: number;
    streakDays: number;
    cultivationRank: string;
  };
}

export interface BadgeItem {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  category: "ACHIEVEMENT" | "ROLE_SPECIAL" | "VIP";
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: "USER" | "STORY" | "CHAPTER" | "GENRE" | "BADGE" | "COMMENT";
  targetId: string;
  targetName?: string;
  details?: string;
  createdAt: string;
}

const INITIAL_BADGES_DATA: BadgeItem[] = [
  {
    id: "badge-quan-tri",
    name: "Quản Trị Tối Cao",
    code: "SUPER_ADMIN",
    description: "Ban điều hành và giám sát toàn bộ nền tảng Mộc Thư.",
    icon: "Shield",
    color: "#EF4444",
    category: "ROLE_SPECIAL",
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "badge-dai-than",
    name: "Đại Thần Sáng Tác",
    code: "AUTHOR_GRANDMASTER",
    description: "Tác giả có tác phẩm đạt trên 1.000.000 lượt đọc.",
    icon: "Crown",
    color: "#D39A5B",
    category: "ACHIEVEMENT",
    createdAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "badge-bach-kim",
    name: "Bạch Kim Tác Giả",
    code: "AUTHOR_PLATINUM",
    description: "Tác giả có tác phẩm xuất sắc nhất Bảng vàng Nguyệt San.",
    icon: "Sparkles",
    color: "#E7C9A5",
    category: "ACHIEVEMENT",
    createdAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "badge-mot-sach",
    name: "Mọt Sách Uyên Bác",
    code: "READER_SCHOLAR",
    description: "Độc giả đã đọc và hoàn thành trên 500 chương truyện.",
    icon: "BookOpen",
    color: "#38BDF8",
    category: "ACHIEVEMENT",
    createdAt: "2026-09-20T00:00:00Z",
  },
  {
    id: "badge-than-nong",
    name: "Thần Nông Nếm Cỏ",
    code: "READER_PIONEER",
    description: "Người đầu tiên đọc và để lại đánh giá cho tác phẩm mới.",
    icon: "Flame",
    color: "#F59E0B",
    category: "ACHIEVEMENT",
    createdAt: "2026-09-22T00:00:00Z",
  },
  {
    id: "badge-binh-luan",
    name: "Bình Luận Đỉnh Cao",
    code: "TOP_COMMENTER",
    description: "Độc giả có nhiều bài bình luận được yêu thích nhất.",
    icon: "Trophy",
    color: "#10B981",
    category: "ACHIEVEMENT",
    createdAt: "2026-09-25T00:00:00Z",
  },
];
export const BADGES_DATA: BadgeItem[] =
  globalData.__MOCTHU_BADGES ?? (globalData.__MOCTHU_BADGES = INITIAL_BADGES_DATA);

const INITIAL_USERS_DATA: UserItem[] = [
  {
    id: "user-admin-hotprince",
    email: "hotprince@mocthu.vn",
    username: "hotprince",
    name: "Hot Prince",
    role: "ADMIN",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    bio: "Quản trị viên tối cao của nền tảng Mộc Thư. Điều hành và phát triển hệ sinh thái chữ Việt.",
    createdAt: "2026-09-01T08:00:00Z",
    badges: ["badge-quan-tri", "badge-dai-than"],
    readingStats: {
      hoursRead: 142,
      wordsRead: 1250000,
      chaptersRead: 620,
      streakDays: 45,
      cultivationRank: "Hóa Thần Thư Thánh",
    },
  },
  {
    id: "user-admin-1",
    email: "admin@mocthu.vn",
    username: "quantrimocthu",
    name: "Quản Trị Mộc Thư",
    role: "ADMIN",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    bio: "Ban quản trị nội dung và điều phối cộng đồng.",
    createdAt: "2026-09-05T09:00:00Z",
    badges: ["badge-quan-tri"],
    readingStats: {
      hoursRead: 85,
      wordsRead: 680000,
      chaptersRead: 340,
      streakDays: 20,
      cultivationRank: "Kim Đan Đại Năng",
    },
  },
  {
    id: "user-author-1",
    email: "author@mocthu.vn",
    username: "coniemvu",
    name: "Cố Niệm Vũ",
    penName: "Cố Niệm Vũ",
    role: "AUTHOR",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    bio: "Lấy câu từ làm đò chở đạo, dùng kiếm ý tạc bóng nhân sinh.",
    createdAt: "2026-09-10T10:00:00Z",
    badges: ["badge-dai-than", "badge-bach-kim"],
    readingStats: {
      hoursRead: 110,
      wordsRead: 950000,
      chaptersRead: 480,
      streakDays: 32,
      cultivationRank: "Nguyên Anh Lão Tổ",
    },
  },
  {
    id: "user-reader-1",
    email: "reader@mocthu.vn",
    username: "lamphong",
    name: "Lâm Phong",
    role: "READER",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    bio: "Mê đắm tiên hiệp cổ phong và những chuyến du sơn ngoạn thủy qua trang sách.",
    createdAt: "2026-09-15T14:30:00Z",
    badges: ["badge-mot-sach", "badge-than-nong"],
    readingStats: {
      hoursRead: 56,
      wordsRead: 420000,
      chaptersRead: 215,
      streakDays: 14,
      cultivationRank: "Trúc Cơ Tu Sĩ",
    },
  },
  {
    id: "user-reader-2",
    email: "thanhkhue@gmail.com",
    username: "thanhkhue",
    name: "Thanh Khuê",
    role: "READER",
    status: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    bio: "Độc giả trung thành của các tác phẩm huyền huyễn đô thị.",
    createdAt: "2026-09-20T16:00:00Z",
    badges: ["badge-binh-luan"],
    readingStats: {
      hoursRead: 28,
      wordsRead: 190000,
      chaptersRead: 95,
      streakDays: 7,
      cultivationRank: "Luyện Khí Kỳ",
    },
  },
  {
    id: "user-spammer",
    email: "spammer@baduser.com",
    username: "spammer_bot",
    name: "Tài Khoản Spam",
    role: "READER",
    status: "BANNED",
    banReason: "Quảng cáo link ngoài và gửi tin nhắn rác liên tục trong khu vực bình luận.",
    bannedAt: "2026-10-01T10:00:00Z",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    createdAt: "2026-09-28T09:00:00Z",
    badges: [],
  },
];
export const USERS_DATA: UserItem[] =
  globalData.__MOCTHU_USERS ?? (globalData.__MOCTHU_USERS = INITIAL_USERS_DATA);

const INITIAL_AUDIT_LOGS_DATA: AuditLogItem[] = [
  {
    id: "log-1",
    adminId: "user-admin-hotprince",
    adminName: "Hot Prince",
    action: "BAN_USER",
    targetType: "USER",
    targetId: "user-spammer",
    targetName: "spammer_bot",
    details: "Khóa vĩnh viễn tài khoản spam quảng cáo bình luận",
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "log-2",
    adminId: "user-admin-hotprince",
    adminName: "Hot Prince",
    action: "ASSIGN_BADGE",
    targetType: "BADGE",
    targetId: "badge-dai-than",
    targetName: "Cố Niệm Vũ",
    details: "Trao tặng danh hiệu Đại Thần Sáng Tác cho Cố Niệm Vũ",
    createdAt: "2026-10-02T14:30:00Z",
  },
  {
    id: "log-3",
    adminId: "user-admin-hotprince",
    adminName: "Hot Prince",
    action: "FEATURE_STORY",
    targetType: "STORY",
    targetId: "story-1",
    targetName: "Trường Khách Sơn Hà",
    details: "Đưa tác phẩm lên Bảng vàng Nguyệt San và Spotlight trang chủ",
    createdAt: "2026-10-03T09:15:00Z",
  },
];
export const AUDIT_LOGS_DATA: AuditLogItem[] =
  globalData.__MOCTHU_AUDIT_LOGS ?? (globalData.__MOCTHU_AUDIT_LOGS = INITIAL_AUDIT_LOGS_DATA);

// Helper functions for mutable in-memory store
export function getUsersList(): UserItem[] {
  return USERS_DATA;
}

export function getUserById(id: string): UserItem | undefined {
  return USERS_DATA.find((u) => u.id === id);
}

export function getUserByUsernameOrEmail(identifier: string): UserItem | undefined {
  const clean = identifier.toLowerCase().trim();
  return USERS_DATA.find(
    (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
  );
}

export function createNewUser(data: Partial<UserItem> & { email: string; username: string; name: string }): UserItem {
  const newUser: UserItem = {
    id: `user-${Date.now()}`,
    email: data.email,
    username: data.username,
    name: data.name,
    role: data.role || "READER",
    status: "ACTIVE",
    penName: data.penName,
    avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    bio: data.bio || "Thành viên yêu thích đọc và sáng tác tại Mộc Thư.",
    createdAt: new Date().toISOString(),
    badges: [],
    readingStats: {
      hoursRead: 0,
      wordsRead: 0,
      chaptersRead: 0,
      streakDays: 1,
      cultivationRank: "Phàm Nhân",
    },
  };
  USERS_DATA.unshift(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserItem>): UserItem | null {
  const index = USERS_DATA.findIndex((u) => u.id === id);
  if (index === -1) return null;
  USERS_DATA[index] = { ...USERS_DATA[index], ...updates };
  return USERS_DATA[index];
}

export function banUser(id: string, reason: string, adminName = "Admin"): boolean {
  const user = getUserById(id);
  if (!user) return false;
  user.status = "BANNED";
  user.banReason = reason;
  user.bannedAt = new Date().toISOString();
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "BAN_USER",
    targetType: "USER",
    targetId: user.id,
    targetName: user.username,
    details: `Khóa tài khoản: ${reason}`,
  });
  return true;
}

export function unbanUser(id: string, adminName = "Admin"): boolean {
  const user = getUserById(id);
  if (!user) return false;
  user.status = "ACTIVE";
  user.banReason = undefined;
  user.bannedAt = undefined;
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "UNBAN_USER",
    targetType: "USER",
    targetId: user.id,
    targetName: user.username,
    details: "Mở khóa tài khoản người dùng",
  });
  return true;
}

export function deleteUser(id: string, adminName = "Admin"): boolean {
  const index = USERS_DATA.findIndex((u) => u.id === id);
  if (index === -1) return false;
  const deleted = USERS_DATA.splice(index, 1)[0];
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "DELETE_USER",
    targetType: "USER",
    targetId: deleted.id,
    targetName: deleted.username,
    details: "Xóa vĩnh viễn tài khoản người dùng khỏi hệ thống",
  });
  return true;
}

export function assignBadgeToUser(userId: string, badgeId: string, adminName = "Admin"): boolean {
  const user = getUserById(userId);
  const badge = BADGES_DATA.find((b) => b.id === badgeId);
  if (!user || !badge) return false;
  if (!user.badges.includes(badgeId)) {
    user.badges.push(badgeId);
    addAuditLog({
      adminId: "admin",
      adminName,
      action: "ASSIGN_BADGE",
      targetType: "BADGE",
      targetId: badge.id,
      targetName: `${badge.name} -> ${user.name}`,
      details: `Trao tặng huy hiệu "${badge.name}" cho ${user.name}`,
    });
  }
  return true;
}

export function removeBadgeFromUser(userId: string, badgeId: string, adminName = "Admin"): boolean {
  const user = getUserById(userId);
  if (!user) return false;
  user.badges = user.badges.filter((b) => b !== badgeId);
  return true;
}

export function createNewGenre(genre: Omit<GenreItem, "count">): GenreItem {
  const newGenre: GenreItem = {
    ...genre,
    count: 0,
  };
  GENRES_DATA.push(newGenre);
  return newGenre;
}

export function deleteGenre(idOrSlug: string, adminName = "Admin"): boolean {
  const index = GENRES_DATA.findIndex((g) => g.id === idOrSlug || g.slug === idOrSlug);
  if (index === -1) return false;
  const deleted = GENRES_DATA.splice(index, 1)[0];
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "DELETE_GENRE",
    targetType: "GENRE",
    targetId: deleted.id,
    targetName: deleted.name,
    details: `Xóa thể loại ${deleted.name}`,
  });
  return true;
}

export function createNewBadge(badge: Omit<BadgeItem, "id" | "createdAt">): BadgeItem {
  const newBadge: BadgeItem = {
    ...badge,
    id: `badge-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  BADGES_DATA.push(newBadge);
  return newBadge;
}

export function deleteBadge(id: string, adminName = "Admin"): boolean {
  const index = BADGES_DATA.findIndex((b) => b.id === id);
  if (index === -1) return false;
  const deleted = BADGES_DATA.splice(index, 1)[0];
  // Clean from users
  USERS_DATA.forEach((u) => {
    u.badges = u.badges.filter((b) => b !== id);
  });
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "DELETE_BADGE",
    targetType: "BADGE",
    targetId: deleted.id,
    targetName: deleted.name,
    details: `Xóa danh hiệu ${deleted.name}`,
  });
  return true;
}

export function banStory(id: string, reason: string, adminName = "Admin"): boolean {
  const story = STORIES_DATA.find((s) => s.id === id);
  if (!story) return false;
  story.status = "DRAFT"; // Hide story
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "BAN_STORY",
    targetType: "STORY",
    targetId: story.id,
    targetName: story.title,
    details: `Khóa tác phẩm do vi phạm: ${reason}`,
  });
  return true;
}

export function unbanStory(id: string, adminName = "Admin"): boolean {
  const story = STORIES_DATA.find((s) => s.id === id);
  if (!story) return false;
  story.status = "ONGOING";
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "UNBAN_STORY",
    targetType: "STORY",
    targetId: story.id,
    targetName: story.title,
    details: "Mở khóa cho phép phát hành tác phẩm trở lại",
  });
  return true;
}

export function featureStory(id: string, isFeatured: boolean, adminName = "Admin"): boolean {
  const story = STORIES_DATA.find((s) => s.id === id);
  if (!story) return false;
  story.featured = isFeatured;
  addAuditLog({
    adminId: "admin",
    adminName,
    action: isFeatured ? "FEATURE_STORY" : "UNFEATURE_STORY",
    targetType: "STORY",
    targetId: story.id,
    targetName: story.title,
    details: isFeatured ? "Ghim tác phẩm lên Spotlight Bảng vàng" : "Hạ ghim nổi bật",
  });
  return true;
}

export function deleteStory(id: string, adminName = "Admin"): boolean {
  const index = STORIES_DATA.findIndex((s) => s.id === id);
  if (index === -1) return false;
  const deleted = STORIES_DATA.splice(index, 1)[0];
  delete CHAPTERS_DATA[deleted.slug];
  addAuditLog({
    adminId: "admin",
    adminName,
    action: "DELETE_STORY",
    targetType: "STORY",
    targetId: deleted.id,
    targetName: deleted.title,
    details: `Xóa vĩnh viễn tác phẩm "${deleted.title}" và toàn bộ chương liên kết`,
  });
  return true;
}

export function addAuditLog(log: Omit<AuditLogItem, "id" | "createdAt">) {
  AUDIT_LOGS_DATA.unshift({
    ...log,
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}

export function adminCreateStory(
  data: {
    title: string;
    slug?: string;
    authorId?: string;
    authorName: string;
    authorPenName?: string;
    authorAvatar?: string;
    coverUrl: string;
    shortDescription: string;
    fullDescription?: string;
    genres: string[];
    tags?: string[];
    status?: "ONGOING" | "COMPLETED" | "DRAFT";
    featured?: boolean;
  },
  adminName = "Admin"
): StoryItem {
  const customSlug = data.slug?.trim();
  const slug =
    customSlug && customSlug.length > 0
      ? customSlug
      : `${slugify(data.title)}-${Date.now().toString().slice(-4)}`;

  const newStory: StoryItem = {
    id: `story-${Date.now()}`,
    title: data.title.trim(),
    slug,
    authorId: data.authorId || `custom-author-${slugify(data.authorName)}`,
    authorName: data.authorName.trim(),
    authorPenName: (data.authorPenName || data.authorName).trim(),
    authorAvatar:
      data.authorAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    coverUrl: data.coverUrl,
    shortDescription: data.shortDescription.trim(),
    fullDescription: (data.fullDescription || data.shortDescription).trim(),
    status: data.status || "ONGOING",
    genres: data.genres && data.genres.length > 0 ? data.genres : ["Tiên Hiệp"],
    tags: data.tags && data.tags.length > 0 ? data.tags : ["Sáng Tác Việt", "Mộc Thư"],
    viewsCount: 0,
    followersCount: 0,
    ratingScore: 5.0,
    ratingsCount: 1,
    totalChapters: 0,
    wordCount: 0,
    featured: !!data.featured,
    updatedAt: new Date().toISOString(),
  };

  STORIES_DATA.unshift(newStory);
  CHAPTERS_DATA[newStory.slug] = [];

  addAuditLog({
    adminId: "admin",
    adminName,
    action: "CREATE_STORY",
    targetType: "STORY",
    targetId: newStory.id,
    targetName: newStory.title,
    details: `Khởi tạo tác phẩm mới "${newStory.title}" của tác giả ${newStory.authorName}`,
  });

  return newStory;
}

export function adminCreateChapter(
  data: {
    storyIdOrSlug: string;
    chapterNumber?: number;
    title: string;
    slug?: string;
    content: string;
    status?: "PUBLISHED" | "DRAFT" | "SCHEDULED";
  },
  adminName = "Admin"
): { chapter: ChapterItem; story: StoryItem } | null {
  const story = STORIES_DATA.find(
    (s) => s.id === data.storyIdOrSlug || s.slug === data.storyIdOrSlug
  );
  if (!story) return null;

  if (!CHAPTERS_DATA[story.slug]) {
    CHAPTERS_DATA[story.slug] = [];
  }

  const existingChapters = CHAPTERS_DATA[story.slug];
  const nextNum =
    data.chapterNumber && data.chapterNumber > 0
      ? data.chapterNumber
      : existingChapters.length + 1;

  const chapSlug =
    data.slug?.trim() ||
    `chuong-${nextNum}-${slugify(data.title)}`;

  const words = data.content.trim().split(/\s+/).filter(Boolean).length;

  const newChapter: ChapterItem = {
    id: `chap-${Date.now()}`,
    storyId: story.id,
    storySlug: story.slug,
    chapterNumber: nextNum,
    title: data.title.trim(),
    slug: chapSlug,
    content: data.content.trim(),
    wordCount: words,
    publishedAt: new Date().toISOString(),
  };

  existingChapters.push(newChapter);
  existingChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

  story.totalChapters = existingChapters.length;
  story.wordCount = existingChapters.reduce((sum, c) => sum + c.wordCount, 0);
  story.updatedAt = new Date().toISOString();

  addAuditLog({
    adminId: "admin",
    adminName,
    action: "CREATE_CHAPTER",
    targetType: "CHAPTER",
    targetId: newChapter.id,
    targetName: `${story.title} - ${newChapter.title}`,
    details: `Đăng ${newChapter.title} cho tác phẩm "${story.title}" (${words} chữ)`,
  });

  return { chapter: newChapter, story };
}


