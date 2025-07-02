CREATE TABLE public.about_us (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_description text,
    detailed_content text,
    hero_image_url text,
    team_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    short_description_hi text,
    detailed_content_hi text
);

CREATE TABLE public.about_us_team_members (
    id bigint NOT NULL,
    about_us_id uuid,
    name text NOT NULL,
    role text NOT NULL,
    image_url text,
    ordering integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slot_number integer NOT NULL,
    html_code text,
    enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    redirect_url text,
    ad_type character varying(20) DEFAULT 'html'::character varying,
    image_width integer,
    image_height integer,
    mobile_height integer,
    desktop_height integer,
    CONSTRAINT ads_ad_type_check CHECK (((ad_type)::text = ANY ((ARRAY['html'::character varying, 'image'::character varying])::text[])))
);

CREATE TABLE public.analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    article_id uuid,
    event_type character varying(50) NOT NULL,
    user_ip inet,
    user_agent text,
    referrer text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    slug character varying(500) NOT NULL,
    summary text,
    content text NOT NULL,
    featured_image_url text,
    status public.article_status DEFAULT 'draft'::public.article_status NOT NULL,
    is_breaking boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    author_id uuid NOT NULL,
    category_id uuid,
    state_id uuid,
    meta_title character varying(255),
    meta_description text,
    meta_keywords text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title_hi text,
    summary_hi text,
    content_hi text,
    newsletter_sent boolean DEFAULT false,
    is_live boolean DEFAULT false NOT NULL,
    publisher_name character varying(255),
    youtube_video_url text,
    facebook_video_url text,
    views integer DEFAULT 0
);

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name_hi text,
    description_hi text
);

CREATE TABLE public.live_streams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    stream_url text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title_hi text,
    description_hi text,
    newsletter_sent boolean DEFAULT false,
    priority integer DEFAULT 0
);

CREATE TABLE public.newsletter_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    subscribed_categories uuid[] DEFAULT '{}'::uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255),
    role public.user_role DEFAULT 'author'::public.user_role NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.short_videos (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text,
    title_hi text,
    description text,
    description_hi text,
    video_url text NOT NULL,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    user_id uuid
);

CREATE TABLE public.socials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    facebook_url text,
    twitter_url text,
    youtube_url text,
    instagram_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name_hi text
);

CREATE TABLE public.support_details (
    id bigint NOT NULL,
    description text,
    account_holder_name text,
    account_number text,
    ifsc_code text,
    bank_name text,
    qr_code_image_url text,
    upi_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description_hi text,
    account_holder_name_hi text
);

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.url_shortener (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(10) NOT NULL,
    article_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    clicks integer DEFAULT 0 NOT NULL
);

CREATE TABLE public.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    video_url text NOT NULL,
    video_type character varying(20) NOT NULL,
    thumbnail_url text,
    category_id uuid,
    state_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title_hi text,
    description_hi text,
    newsletter_sent boolean DEFAULT false,
    CONSTRAINT videos_video_type_check CHECK (((video_type)::text = ANY ((ARRAY['youtube'::character varying, 'facebook'::character varying])::text[])))
); 