//  Copyright © 2016 SAP. All rights reserved.

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "SMPKeychainCertProviderPlugin.h"

@interface KeychainCertProvider : NSObject <CertificateProvider>
    @property (nonatomic, strong) NSString* certLabel;

@end
