import random
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional
import uuid

from app.schemas.marketing_data import MarketingDataCreate


class SyntheticDataGenerator:
    """Generate realistic synthetic marketing data for demo purposes."""
    
    CHANNELS = [
        'google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 
        'youtube_ads', 'linkedin_ads', 'twitter_ads', 'pinterest_ads',
        'email_marketing', 'seo_organic', 'display_ads', 'affiliate_marketing'
    ]
    
    CAMPAIGN_TEMPLATES = {
        'google_ads': ['Search_Campaign_{}', 'Shopping_Campaign_{}', 'Display_Campaign_{}'],
        'facebook_ads': ['FB_Awareness_{}', 'FB_Conversion_{}', 'FB_Retargeting_{}'],
        'instagram_ads': ['IG_Stories_{}', 'IG_Feed_{}', 'IG_Reels_{}'],
        'tiktok_ads': ['TT_Video_{}', 'TT_Spark_{}', 'TT_Collection_{}'],
        'youtube_ads': ['YT_Skippable_{}', 'YT_Bumper_{}', 'YT_Discovery_{}'],
        'linkedin_ads': ['LI_Sponsored_{}', 'LI_Message_{}', 'LI_Dynamic_{}'],
        'twitter_ads': ['TW_Promoted_{}', 'TW_Follower_{}', 'TW_Website_{}'],
        'pinterest_ads': ['PIN_Shopping_{}', 'PIN_Awareness_{}', 'PIN_Traffic_{}'],
        'email_marketing': ['Email_Newsletter_{}', 'Email_Promo_{}', 'Email_Welcome_{}'],
        'seo_organic': ['Organic_Blog_{}', 'Organic_Product_{}', 'Organic_Landing_{}'],
        'display_ads': ['Display_Banner_{}', 'Display_Video_{}', 'Display_Native_{}'],
        'affiliate_marketing': ['Affiliate_Partner_{}', 'Affiliate_Influencer_{}', 'Affiliate_Network_{}']
    }
    
    CHANNEL_CHARACTERISTICS = {
        'google_ads': {'spend_range': (500, 5000), 'ctr_range': (0.02, 0.08), 'cvr_range': (0.02, 0.06)},
        'facebook_ads': {'spend_range': (300, 3000), 'ctr_range': (0.015, 0.06), 'cvr_range': (0.015, 0.04)},
        'instagram_ads': {'spend_range': (200, 2500), 'ctr_range': (0.01, 0.05), 'cvr_range': (0.01, 0.035)},
        'tiktok_ads': {'spend_range': (150, 2000), 'ctr_range': (0.02, 0.09), 'cvr_range': (0.008, 0.025)},
        'youtube_ads': {'spend_range': (400, 4000), 'ctr_range': (0.005, 0.03), 'cvr_range': (0.01, 0.04)},
        'linkedin_ads': {'spend_range': (800, 6000), 'ctr_range': (0.008, 0.04), 'cvr_range': (0.02, 0.08)},
        'twitter_ads': {'spend_range': (100, 1500), 'ctr_range': (0.01, 0.04), 'cvr_range': (0.008, 0.03)},
        'pinterest_ads': {'spend_range': (150, 2000), 'ctr_range': (0.01, 0.05), 'cvr_range': (0.01, 0.04)},
        'email_marketing': {'spend_range': (50, 500), 'ctr_range': (0.15, 0.35), 'cvr_range': (0.05, 0.15)},
        'seo_organic': {'spend_range': (0, 200), 'ctr_range': (0.02, 0.08), 'cvr_range': (0.02, 0.06)},
        'display_ads': {'spend_range': (200, 2000), 'ctr_range': (0.005, 0.02), 'cvr_range': (0.005, 0.02)},
        'affiliate_marketing': {'spend_range': (100, 1000), 'ctr_range': (0.01, 0.06), 'cvr_range': (0.02, 0.08)}
    }

    def __init__(self, start_date: date = None, end_date: date = None):
        """Initialize the generator with date range."""
        self.end_date = end_date or date.today()
        self.start_date = start_date or (self.end_date - timedelta(days=365))  # 1 year of data
        
    def generate_campaign_name(self, channel: str) -> str:
        """Generate a realistic campaign name for the channel."""
        templates = self.CAMPAIGN_TEMPLATES.get(channel, ['Campaign_{}'])
        template = random.choice(templates)
        campaign_id = random.randint(1000, 9999)
        return template.format(campaign_id)
    
    def calculate_metrics(self, channel: str, spend: Decimal) -> Dict[str, int]:
        """Calculate realistic impressions, clicks, conversions based on spend and channel."""
        characteristics = self.CHANNEL_CHARACTERISTICS[channel]
        
        cpm = random.uniform(1.0, 10.0)
        impressions = int(float(spend) / cpm * 1000)
        
        ctr = random.uniform(*characteristics['ctr_range'])
        clicks = int(impressions * ctr)
        
        cvr = random.uniform(*characteristics['cvr_range'])
        conversions = int(clicks * cvr)
        
        return {
            'impressions': max(impressions, 1),
            'clicks': max(clicks, 1),
            'conversions': max(conversions, 0)
        }
    
    def calculate_revenue(self, conversions: int, channel: str) -> Decimal:
        """Calculate revenue based on conversions and channel-specific AOV."""
        aov_ranges = {
            'google_ads': (80, 200),
            'facebook_ads': (60, 150),
            'instagram_ads': (50, 120),
            'tiktok_ads': (40, 100),
            'youtube_ads': (70, 180),
            'linkedin_ads': (150, 400),
            'twitter_ads': (45, 110),
            'pinterest_ads': (55, 130),
            'email_marketing': (90, 220),
            'seo_organic': (85, 190),
            'display_ads': (50, 120),
            'affiliate_marketing': (70, 160)
        }
        
        aov_range = aov_ranges.get(channel, (60, 150))
        aov = random.uniform(*aov_range)
        revenue = conversions * aov
        
        return Decimal(str(round(revenue, 2)))
    
    def generate_daily_data(self, target_date: date, channels: List[str] = None, custom_spend_ranges: Dict[str, tuple] = None) -> List[MarketingDataCreate]:
        """Generate marketing data for a specific date."""
        if channels is None:
            num_channels = random.randint(6, 10)
            channels = random.sample(self.CHANNELS, num_channels)
        
        daily_data = []
        
        for channel in channels:
            num_campaigns = random.choices([1, 2, 3], weights=[0.7, 0.25, 0.05])[0]
            
            for _ in range(num_campaigns):
                characteristics = self.CHANNEL_CHARACTERISTICS[channel]
                
                if custom_spend_ranges and channel in custom_spend_ranges:
                    base_spend_range = custom_spend_ranges[channel]
                else:
                    base_spend_range = characteristics['spend_range']
                
                weekend_multiplier = 0.6 if target_date.weekday() >= 5 and channel in ['linkedin_ads', 'email_marketing'] else 1.0
                
                seasonal_multiplier = 1.3 if target_date.month in [11, 12] else 1.0
                
                min_spend = base_spend_range[0] * weekend_multiplier * seasonal_multiplier
                max_spend = base_spend_range[1] * weekend_multiplier * seasonal_multiplier
                
                spend = Decimal(str(round(random.uniform(min_spend, max_spend), 2)))
                
                metrics = self.calculate_metrics(channel, spend)
                revenue = self.calculate_revenue(metrics['conversions'], channel)
                
                quality_score = random.uniform(0.85, 0.98)
                
                campaign_data = MarketingDataCreate(
                    source='synthetic',
                    date=target_date,
                    channel=channel,
                    campaign_name=self.generate_campaign_name(channel),
                    spend=spend,
                    impressions=metrics['impressions'],
                    clicks=metrics['clicks'],
                    conversions=metrics['conversions'],
                    revenue=revenue
                )
                
                daily_data.append(campaign_data)
        
        return daily_data
    
    def generate_dataset(self, num_days: int = None) -> List[MarketingDataCreate]:
        """Generate a complete dataset for the specified date range."""
        if num_days is None:
            num_days = (self.end_date - self.start_date).days + 1
        
        dataset = []
        current_date = self.start_date
        
        for day in range(num_days):
            daily_data = self.generate_daily_data(current_date)
            dataset.extend(daily_data)
            current_date += timedelta(days=1)
        
        return dataset
    
    def generate_sample_dataset(self, days: int = 90) -> List[MarketingDataCreate]:
        """Generate a sample dataset for the last N days."""
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        self.start_date = start_date
        self.end_date = end_date
        
        return self.generate_dataset(days)


def generate_demo_data(
    days: int = 90, 
    channels: List[str] = None, 
    custom_spend_ranges: Dict[str, tuple] = None,
    start_date: date = None,
    end_date: date = None
) -> List[MarketingDataCreate]:
    """Convenience function to generate demo data with custom parameters."""
    generator = SyntheticDataGenerator(start_date=start_date, end_date=end_date)
    
    if start_date and end_date:
        generator.start_date = start_date
        generator.end_date = end_date
        dataset = []
        current_date = start_date
        
        while current_date <= end_date:
            daily_data = generator.generate_daily_data(current_date, channels, custom_spend_ranges)
            dataset.extend(daily_data)
            current_date += timedelta(days=1)
        
        return dataset
    else:
        dataset = []
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        current_date = start_date
        
        for day in range(days):
            daily_data = generator.generate_daily_data(current_date, channels, custom_spend_ranges)
            dataset.extend(daily_data)
            current_date += timedelta(days=1)
        
        return dataset


def get_channel_info() -> Dict[str, Dict[str, Any]]:
    """Get information about available channels and their characteristics."""
    generator = SyntheticDataGenerator()
    channel_info = {}
    
    for channel in generator.CHANNELS:
        characteristics = generator.CHANNEL_CHARACTERISTICS[channel]
        channel_info[channel] = {
            'name': channel.replace('_', ' ').title(),
            'default_spend_range': characteristics['spend_range'],
            'category': _get_channel_category(channel)
        }
    
    return channel_info


def _get_channel_category(channel: str) -> str:
    """Categorize channels for better UI organization."""
    categories = {
        'paid_social': ['facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads', 'twitter_ads', 'pinterest_ads'],
        'search_display': ['google_ads', 'youtube_ads', 'display_ads'],
        'organic_email': ['email_marketing', 'seo_organic'],
        'partnerships': ['affiliate_marketing']
    }
    
    for category, channels in categories.items():
        if channel in channels:
            return category
    return 'other'
