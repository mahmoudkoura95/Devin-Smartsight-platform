#!/usr/bin/env python3
import sys
import os
from datetime import date, timedelta
sys.path.append('/home/ubuntu/repos/smartsight-platform/backend')

from app.utils.synthetic_data import generate_demo_data, get_channel_info

def test_enhanced_synthetic_data():
    print("Testing enhanced synthetic data generation...")
    
    channel_info = get_channel_info()
    print(f"Available channels: {len(channel_info)}")
    for channel, info in list(channel_info.items())[:3]:
        print(f"  {channel}: {info['name']} ({info['category']})")
    
    selected_channels = ['google_ads', 'facebook_ads', 'email_marketing']
    custom_spend_ranges = {
        'google_ads': (1000, 3000),
        'facebook_ads': (500, 1500),
        'email_marketing': (100, 300)
    }
    
    start_date = date.today() - timedelta(days=30)
    end_date = date.today()
    
    data = generate_demo_data(
        channels=selected_channels,
        custom_spend_ranges=custom_spend_ranges,
        start_date=start_date,
        end_date=end_date
    )
    
    print(f"Generated {len(data)} records")
    if data:
        sample = data[0]
        print(f"Sample: {sample.channel}, ${sample.spend}, {sample.impressions} impressions")
        channels = set([d.channel for d in data])
        print(f"Channels: {sorted(channels)}")
    
    print("Enhanced synthetic data test completed successfully!")

if __name__ == "__main__":
    test_enhanced_synthetic_data()
